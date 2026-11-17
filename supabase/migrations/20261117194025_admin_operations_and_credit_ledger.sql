-- Additive migration against the inspected code-access backend. No historical
-- transactions are reconstructed and existing balances/progress are preserved.
create schema if not exists game_private;
revoke all on schema game_private from public, anon, authenticated;

-- Retain code-based authentication, rejecting a nullable role explicitly.
create or replace function public.resolve_access_code(p_code text,p_required_role text default null)
returns public.access_codes language plpgsql security definer set search_path = '' as $$
declare v_access public.access_codes;
begin
  select * into v_access from public.access_codes where code=trim(p_code) and is_active=true;
  if not found then raise exception 'INVALID_CODE'; end if;
  if p_required_role is not null and v_access.role is distinct from p_required_role then raise exception 'FORBIDDEN'; end if;
  return v_access;
end $$;

alter table public.player_progress
  add column if not exists state_revision bigint not null default 0,
  add column if not exists admin_epoch bigint not null default 0,
  add column if not exists transition_state jsonb not null default '{"pendingBridge":null}'::jsonb;

create table public.player_admin_operations (
  id uuid primary key,
  access_code_id uuid not null references public.access_codes(id) on delete cascade,
  actor_id uuid not null references public.access_codes(id),
  title text not null,
  reason text not null,
  settings jsonb not null default '{}'::jsonb,
  money_lines jsonb not null default '[]'::jsonb,
  before_state jsonb not null,
  after_state jsonb,
  restores_operation_id uuid references public.player_admin_operations(id),
  created_at timestamptz not null default now()
);
create index on public.player_admin_operations(access_code_id, created_at desc);
alter table public.player_admin_operations enable row level security;
revoke all on public.player_admin_operations from anon, authenticated;

create table public.player_credit_movements (
  seq bigint generated always as identity unique,
  id uuid primary key default gen_random_uuid(),
  access_code_id uuid not null references public.access_codes(id) on delete cascade,
  actor_id uuid references public.access_codes(id),
  operation_id uuid references public.player_admin_operations(id),
  root_id uuid not null,
  reverses_id uuid unique references public.player_credit_movements(id),
  is_effective boolean not null default true,
  kind text not null,
  label text not null,
  category_id text,
  challenge_id text,
  delta integer not null,
  balance_after integer not null,
  created_at timestamptz not null default now()
);
create index on public.player_credit_movements(access_code_id, seq desc);
create index on public.player_credit_movements(operation_id);
alter table public.player_credit_movements enable row level security;
revoke all on public.player_credit_movements from anon, authenticated;

create table game_private.save_receipts (
  access_code_id uuid not null references public.access_codes(id) on delete cascade,
  request_id uuid not null,
  response jsonb not null,
  created_at timestamptz not null default now(),
  primary key(access_code_id, request_id)
);
alter table game_private.save_receipts enable row level security;

insert into public.player_credit_movements(access_code_id, root_id, is_effective, kind, label, delta, balance_after)
select access_code_id, gen_random_uuid(), false, 'opening', 'Saldo iniziale: attività precedenti non ricostruite', credits, credits
from public.player_progress;

create function game_private.capture_progress_change() returns trigger
language plpgsql set search_path = '' as $$
declare v_id uuid := gen_random_uuid();
begin
  if tg_op = 'INSERT' then
    insert into public.player_credit_movements(id, access_code_id, root_id, is_effective, kind, label, delta, balance_after)
    values(v_id,new.access_code_id,v_id,false,'opening','Saldo iniziale',new.credits,new.credits);
  else
    new.state_revision := old.state_revision + 1;
    if new.credits <> old.credits and coalesce(current_setting('game.ledger_target',true),'') <> new.access_code_id::text then
      insert into public.player_credit_movements(id,access_code_id,root_id,kind,label,delta,balance_after)
      values(v_id,new.access_code_id,v_id,'external','Rettifica esterna / client precedente',new.credits-old.credits,new.credits);
    end if;
  end if;
  return new;
end $$;
create trigger capture_game_progress before update on public.player_progress
for each row execute function game_private.capture_progress_change();
create trigger capture_game_opening after insert on public.player_progress
for each row execute function game_private.capture_progress_change();

create function game_private.bundle(p_id uuid) returns jsonb
language sql set search_path = '' as $$
  select jsonb_build_object(
    'snapshot', jsonb_build_object('access_code_id',a.id,'role',a.role,'progress',to_jsonb(p),'daily_limits',to_jsonb(d)),
    'archives',coalesce((select jsonb_agg(to_jsonb(r)) from public.player_room_archives r where r.access_code_id=p_id),'[]'::jsonb),
    'leaves',coalesce((select jsonb_agg(to_jsonb(m) order by m.seq) from public.player_credit_movements m
      where m.access_code_id=p_id and not exists(select 1 from public.player_credit_movements child where child.reverses_id=m.id)),'[]'::jsonb)
  ) from public.access_codes a join public.player_progress p on p.access_code_id=a.id
  left join public.player_daily_limits d on d.access_code_id=a.id and d.play_date=public.app_rome_today()
  where a.id=p_id;
$$;

create function public.admin_list_players(p_admin_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform public.resolve_access_code(p_admin_code,'admin');
  return (select coalesce(jsonb_agg(jsonb_build_object('code',code,'role',role) order by role,code),'[]'::jsonb)
    from public.access_codes where is_active=true);
end $$;

create function public.admin_get_player_context(p_admin_code text,p_target_code text,p_history_offset integer default 0) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_target public.access_codes; v_bundle jsonb;
begin
  perform public.resolve_access_code(p_admin_code,'admin');
  v_target := public.resolve_access_code(p_target_code,null);
  perform public.ensure_player_progress(v_target.id);
  perform public.ensure_daily_limits(v_target.id);
  v_bundle := game_private.bundle(v_target.id);
  return v_bundle || jsonb_build_object(
    'movements',coalesce((select jsonb_agg(to_jsonb(t) order by t.seq desc) from (
      select m.*,not exists(select 1 from public.player_credit_movements c where c.reverses_id=m.id) as is_current
      from public.player_credit_movements m where m.access_code_id=v_target.id
      order by seq desc limit 50 offset greatest(p_history_offset,0)) t),'[]'::jsonb),
    'movement_count',(select count(*) from public.player_credit_movements where access_code_id=v_target.id),
    'operations',coalesce((select jsonb_agg(to_jsonb(t) order by t.created_at desc) from (
      select id,title,reason,settings,money_lines,restores_operation_id,created_at,
        (before_state#>>'{snapshot,progress,credits}')::integer as credits_before,
        (after_state#>>'{snapshot,progress,credits}')::integer as credits_after
      from public.player_admin_operations where access_code_id=v_target.id
      order by created_at desc limit 50 offset greatest(p_history_offset,0)) t),'[]'::jsonb));
end $$;

create function public.admin_get_operation(p_admin_code text,p_target_code text,p_operation_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_target public.access_codes;
begin
  perform public.resolve_access_code(p_admin_code,'admin');
  v_target := public.resolve_access_code(p_target_code,null);
  return (select to_jsonb(o) from public.player_admin_operations o where o.id=p_operation_id and o.access_code_id=v_target.id);
end $$;

create function public.admin_apply_operation(p_admin_code text,p_target_code text,p_plan jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_admin public.access_codes; v_target public.access_codes; v_progress public.player_progress;
  v_before jsonb; v_after jsonb; v_line jsonb; v_source_id text; v_source public.player_credit_movements;
  v_id uuid; v_op uuid := (p_plan->>'request_id')::uuid;
  v_balance integer; v_inverse integer; v_adjustment integer; v_delta integer := 0; v_archive jsonb;
begin
  v_admin := public.resolve_access_code(p_admin_code,'admin');
  v_target := public.resolve_access_code(p_target_code,null);
  perform public.ensure_player_progress(v_target.id);
  perform public.ensure_daily_limits(v_target.id);
  select * into v_progress from public.player_progress where access_code_id=v_target.id for update;
  if exists(select 1 from public.player_admin_operations where id=v_op and access_code_id=v_target.id and actor_id=v_admin.id) then
    return public.admin_get_player_context(p_admin_code,p_target_code);
  end if;
  if v_progress.state_revision <> (p_plan->>'expected_revision')::bigint or not p_plan ? 'expected_revision' then raise exception 'STALE_STATE'; end if;
  if length(trim(coalesce(p_plan->>'reason',''))) = 0 then raise exception 'REASON_REQUIRED'; end if;
  if jsonb_typeof(p_plan->'archives') <> 'array' or jsonb_typeof(p_plan->'money_lines') <> 'array' then raise exception 'INVALID_PLAN'; end if;
  if not (p_plan#>'{progress,unlocked_category_ids}') @> '["musica"]'::jsonb then raise exception 'INITIAL_ROOM_REQUIRED'; end if;
  v_before := game_private.bundle(v_target.id);
  insert into public.player_admin_operations(id,access_code_id,actor_id,title,reason,settings,money_lines,before_state,restores_operation_id)
  values(v_op,v_target.id,v_admin.id,p_plan->>'title',p_plan->>'reason',p_plan->'settings',p_plan->'money_lines',v_before,(p_plan->>'restore_operation_id')::uuid);
  v_balance := v_progress.credits;
  for v_line in select value from jsonb_array_elements(p_plan->'money_lines') loop
    v_inverse := 0;
    for v_source_id in select jsonb_array_elements_text(coalesce(v_line->'source_ids','[]'::jsonb)) loop
      select * into v_source from public.player_credit_movements m where m.id=v_source_id::uuid and m.access_code_id=v_target.id;
      if not found or v_source.kind='opening' or exists(select 1 from public.player_credit_movements where reverses_id=v_source.id) then raise exception 'STALE_MOVEMENT'; end if;
      v_id := gen_random_uuid();
      v_balance := v_balance-v_source.delta;
      v_inverse := v_inverse-v_source.delta;
      insert into public.player_credit_movements(id,access_code_id,actor_id,operation_id,root_id,reverses_id,is_effective,kind,label,category_id,challenge_id,delta,balance_after)
      values(v_id,v_target.id,v_admin.id,v_op,v_source.root_id,v_source.id,not v_source.is_effective,v_source.kind,
        case when v_source.is_effective then 'Annullamento: ' else 'Ripristino: ' end || v_source.label,
        v_source.category_id,v_source.challenge_id,-v_source.delta,v_balance);
    end loop;
    v_adjustment := (v_line->>'delta')::integer-v_inverse;
    if v_adjustment <> 0 then
      v_id := gen_random_uuid();
      v_balance := v_balance+v_adjustment;
      insert into public.player_credit_movements(id,access_code_id,actor_id,operation_id,root_id,kind,label,category_id,challenge_id,delta,balance_after)
      values(v_id,v_target.id,v_admin.id,v_op,v_id,'admin_adjustment',v_line->>'label',v_line->>'category_id',v_line->>'challenge_id',v_adjustment,v_balance);
    end if;
    v_delta := v_delta+(v_line->>'delta')::integer;
  end loop;
  if v_balance < 0 or v_balance <> (p_plan#>>'{progress,credits}')::integer then raise exception 'INVALID_BALANCE'; end if;
  perform set_config('game.ledger_target',v_target.id::text,true);
  update public.player_progress set
    credits=v_balance,
    unlocked_category_ids=array(select jsonb_array_elements_text(p_plan#>'{progress,unlocked_category_ids}')),
    room_progress=p_plan#>'{progress,room_progress}',
    active_session=nullif(p_plan#>'{progress,active_session}','null'::jsonb),
    current_room=p_plan#>>'{progress,current_room}',current_challenge_id=p_plan#>>'{progress,current_challenge_id}',
    transition_state=coalesce(p_plan#>'{progress,transition_state}','{"pendingBridge":null}'::jsonb),
    admin_epoch=admin_epoch+1,last_played_at=now()
  where access_code_id=v_target.id;
  perform set_config('game.ledger_target','',true);
  update public.player_daily_limits set attempts_remaining=(p_plan#>>'{daily,attempts_remaining}')::integer,
    lives_remaining=(p_plan#>>'{daily,lives_remaining}')::integer,last_activity_at=now()
  where access_code_id=v_target.id and play_date=public.app_rome_today();
  delete from public.player_room_archives where access_code_id=v_target.id;
  for v_archive in select value from jsonb_array_elements(p_plan->'archives') loop
    insert into public.player_room_archives(access_code_id,category_id,summary,completed_snapshot,archive_version)
    values(v_target.id,v_archive->>'category_id',v_archive->'summary',v_archive->'completed_snapshot',coalesce((v_archive->>'archive_version')::integer,1));
  end loop;
  v_after := game_private.bundle(v_target.id);
  update public.player_admin_operations set after_state=v_after where id=v_op;
  return public.admin_get_player_context(p_admin_code,p_target_code);
end $$;

create or replace function public.app_save_snapshot(p_code text,p_progress jsonb,p_daily jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_access public.access_codes; v_old public.player_progress; v_daily public.player_daily_limits;
  v_receipt jsonb; v_request uuid := (p_progress->>'save_id')::uuid;
  v_item jsonb; v_id uuid; v_balance integer; v_sum integer := 0; v_key text; v_value jsonb; v_archive jsonb;
begin
  v_access := public.resolve_access_code(p_code,null);
  perform public.ensure_player_progress(v_access.id);
  v_daily := public.ensure_daily_limits(v_access.id);
  select * into v_old from public.player_progress where access_code_id=v_access.id for update;
  if v_request is not null then
    select response into v_receipt from game_private.save_receipts where access_code_id=v_access.id and request_id=v_request;
    if found then return v_receipt; end if;
  end if;
  if (p_progress ? 'state_revision' and (p_progress->>'state_revision')::bigint <> v_old.state_revision)
    or (not p_progress ? 'state_revision' and v_old.admin_epoch > 0) then raise exception 'STALE_STATE'; end if;
  -- Reset tools must go through the audited admin RPC, including on an admin's own profile.
  if coalesce((p_daily->>'attempts_remaining')::integer,v_daily.attempts_remaining) > v_daily.attempts_remaining
    or coalesce((p_daily->>'lives_remaining')::integer,v_daily.lives_remaining) > v_daily.lives_remaining then raise exception 'ADMIN_REQUIRED'; end if;
  if p_progress ? 'room_progress' then
    for v_key,v_value in select * from jsonb_each(v_old.room_progress) loop
      if not (p_progress->'room_progress') ? v_key
        or (coalesce((v_value->>'prizeWon')::boolean,false) and not coalesce((p_progress#>>array['room_progress',v_key,'prizeWon'])::boolean,false))
        or (v_value->'introSeen'='true'::jsonb and p_progress#>array['room_progress',v_key,'introSeen']='false'::jsonb)
        or (v_value->>'startedAt' is not null and p_progress#>>array['room_progress',v_key,'startedAt'] is null)
      then raise exception 'ADMIN_REQUIRED'; end if;
    end loop;
  end if;
  if p_progress ? 'unlocked_category_ids' and not (p_progress->'unlocked_category_ids') @> to_jsonb(v_old.unlocked_category_ids) then raise exception 'ADMIN_REQUIRED'; end if;
  if v_old.active_session->>'categoryId'=p_progress#>>'{active_session,categoryId}' then
    for v_key in select jsonb_object_keys(coalesce(v_old.active_session->'challengeResults','{}'::jsonb)) loop
      if not coalesce(p_progress#>'{active_session,challengeResults}','{}'::jsonb) ? v_key then raise exception 'ADMIN_REQUIRED'; end if;
    end loop;
  end if;
  v_balance := v_old.credits;
  if p_progress ? 'credit_movements' then
    for v_item in select value from jsonb_array_elements(p_progress->'credit_movements') loop
      if v_item->>'kind' not in ('challenge_reward','hint','extra_time','room_access','bundle_access','bonus','spend')
        or ((v_item->>'kind') in ('hint','extra_time','room_access','bundle_access','spend') and (v_item->>'delta')::integer > 0)
        or ((v_item->>'kind') in ('challenge_reward','bonus') and (v_item->>'delta')::integer < 0) then raise exception 'INVALID_MOVEMENT'; end if;
      v_id := (v_item->>'id')::uuid;
      v_balance := v_balance+(v_item->>'delta')::integer;
      v_sum := v_sum+(v_item->>'delta')::integer;
      insert into public.player_credit_movements(id,access_code_id,actor_id,root_id,kind,label,category_id,challenge_id,delta,balance_after)
      values(v_id,v_access.id,v_access.id,v_id,v_item->>'kind',v_item->>'label',v_item->>'category_id',v_item->>'challenge_id',(v_item->>'delta')::integer,v_balance);
    end loop;
    if v_balance <> (p_progress->>'credits')::integer then raise exception 'INVALID_BALANCE'; end if;
    perform set_config('game.ledger_target',v_access.id::text,true);
  end if;
  update public.player_progress set
    credits=coalesce((p_progress->>'credits')::integer,credits),
    unlocked_category_ids=case when p_progress ? 'unlocked_category_ids' then array(select jsonb_array_elements_text(p_progress->'unlocked_category_ids')) else unlocked_category_ids end,
    current_room=case when p_progress ? 'current_room' then p_progress->>'current_room' else current_room end,
    current_challenge_id=case when p_progress ? 'current_challenge_id' then p_progress->>'current_challenge_id' else current_challenge_id end,
    room_progress=coalesce(p_progress->'room_progress',room_progress),
    active_session=case when p_progress ? 'active_session' then nullif(p_progress->'active_session','null'::jsonb) else active_session end,
    transition_state=coalesce(p_progress->'transition_state',transition_state),last_played_at=now()
  where access_code_id=v_access.id;
  perform set_config('game.ledger_target','',true);
  for v_archive in select value from jsonb_array_elements(coalesce(p_progress->'archives','[]'::jsonb)) loop
    insert into public.player_room_archives(access_code_id,category_id,summary,completed_snapshot,archive_version)
    values(v_access.id,v_archive->>'category_id',v_archive->'summary',v_archive->'completed_snapshot',coalesce((v_archive->>'archive_version')::integer,1))
    on conflict(access_code_id,category_id) do update set summary=excluded.summary,completed_snapshot=excluded.completed_snapshot,updated_at=now();
  end loop;
  update public.player_daily_limits set
    attempts_remaining=coalesce((p_daily->>'attempts_remaining')::integer,attempts_remaining),
    lives_remaining=coalesce((p_daily->>'lives_remaining')::integer,lives_remaining),last_activity_at=now()
  where access_code_id=v_access.id and play_date=public.app_rome_today();
  v_receipt := public.app_get_snapshot(p_code);
  if v_request is not null then insert into game_private.save_receipts(access_code_id,request_id,response) values(v_access.id,v_request,v_receipt); end if;
  return v_receipt;
end $$;

-- Disable the old unversioned reset paths; the panel supplies an audited plan.
create or replace function public.app_clear_room_archives(p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin perform public.resolve_access_code(p_code,'admin'); raise exception 'USE_ADMIN_PANEL'; end $$;
create or replace function public.app_save_room_archive(p_code text,p_category_id text,p_archive jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_access public.access_codes; v_progress public.player_progress; v_previous jsonb; v_key text;
begin
  v_access := public.resolve_access_code(p_code,null);
  select * into v_progress from public.player_progress where access_code_id=v_access.id for update;
  if v_progress.admin_epoch > 0 and coalesce((p_archive->>'state_revision')::bigint,-1) <> v_progress.state_revision then raise exception 'STALE_STATE'; end if;
  select completed_snapshot into v_previous from public.player_room_archives where access_code_id=v_access.id and category_id=p_category_id;
  for v_key in select jsonb_object_keys(coalesce(v_previous->'challengeResults','{}'::jsonb)) loop
    if not coalesce(p_archive#>'{completed_snapshot,challengeResults}','{}'::jsonb) ? v_key then raise exception 'ADMIN_REQUIRED'; end if;
  end loop;
  insert into public.player_room_archives(access_code_id,category_id,summary,completed_snapshot,archive_version)
  values(v_access.id,p_category_id,coalesce(p_archive->'summary','{}'::jsonb),coalesce(p_archive->'completed_snapshot','{}'::jsonb),coalesce((p_archive->>'archive_version')::integer,1))
  on conflict(access_code_id,category_id) do update set summary=excluded.summary,completed_snapshot=excluded.completed_snapshot,updated_at=now();
  return jsonb_build_object('ok',true);
end $$;
create or replace function public.admin_reset_daily_limits(p_admin_code text,p_target_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin perform public.resolve_access_code(p_admin_code,'admin'); raise exception 'USE_ADMIN_PANEL'; end $$;
create or replace function public.admin_reset_player(p_admin_code text,p_target_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin perform public.resolve_access_code(p_admin_code,'admin'); raise exception 'USE_ADMIN_PANEL'; end $$;

revoke all on all functions in schema game_private from public,anon,authenticated;
revoke execute on function public.resolve_access_code(text,text),public.ensure_player_progress(uuid),public.ensure_daily_limits(uuid) from public,anon,authenticated;
revoke all on function public.admin_list_players(text),public.admin_get_player_context(text,text,integer),
  public.admin_get_operation(text,text,uuid),public.admin_apply_operation(text,text,jsonb) from public;
grant execute on function public.admin_list_players(text),public.admin_get_player_context(text,text,integer),
  public.admin_get_operation(text,text,uuid),public.admin_apply_operation(text,text,jsonb) to anon,authenticated;
