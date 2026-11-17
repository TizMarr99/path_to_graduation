-- All synthetic users, movements and operations are rolled back. No real
-- access code is used and no email endpoint is called.
begin;
do $$
declare
  v_admin text := '__admin_test_' || gen_random_uuid()::text;
  v_player text := '__player_test_' || gen_random_uuid()::text;
  v_admin_id uuid := gen_random_uuid(); v_player_id uuid := gen_random_uuid();
  v_reward uuid := gen_random_uuid(); v_hint uuid := gen_random_uuid();
  v_request uuid := gen_random_uuid(); v_operation uuid := gen_random_uuid();
  v_snapshot jsonb; v_payload jsonb; v_before jsonb; v_context jsonb; v_plan jsonb; v_sources jsonb; v_leaf jsonb;
  v_revision bigint; v_count integer;
begin
  insert into public.access_codes(id,code,role,is_active) values(v_admin_id,v_admin,'admin',true),(v_player_id,v_player,'player',true);
  v_snapshot := public.app_get_snapshot(v_player);
  v_payload := jsonb_build_object('save_id',v_request,'state_revision',0,'credits',30,
    'credit_movements',jsonb_build_array(jsonb_build_object('id',v_reward,'kind','challenge_reward','label','Ricompensa test','delta',30,'category_id','cura-corpo','challenge_id','q')),
    'room_progress','{"cura-corpo":{"startedAt":123,"prizeWon":true,"archiveAvailable":true}}'::jsonb,
    'archives','[{"category_id":"cura-corpo","summary":{},"completed_snapshot":{"challengeResults":{"q":{"isCorrect":true}}}}]'::jsonb);
  v_snapshot := public.app_save_snapshot(v_player,v_payload,'{"attempts_remaining":2,"lives_remaining":1}');
  if (v_snapshot#>>'{progress,credits}')::integer <> 30 then raise exception 'reward failed'; end if;
  perform public.app_save_snapshot(v_player,v_payload,'{"attempts_remaining":2,"lives_remaining":1}');
  if (select count(*) from public.player_credit_movements where access_code_id=v_player_id) <> 2 then raise exception 'save receipt / opening idempotency failed'; end if;
  v_payload := jsonb_build_object('save_id',gen_random_uuid(),'state_revision',v_snapshot#>'{progress,state_revision}','credits',20,
    'credit_movements',jsonb_build_array(jsonb_build_object('id',v_hint,'kind','hint','label','Indizio test','delta',-10,'category_id','cura-corpo','challenge_id','q')));
  v_snapshot := public.app_save_snapshot(v_player,v_payload,'{}');
  v_before := public.admin_get_player_context(v_admin,v_player);
  v_plan := jsonb_build_object('request_id',v_operation,'expected_revision',v_snapshot#>'{progress,state_revision}',
    'title','Reset test','reason','Verifica transazionale','settings','{"operation":"room"}'::jsonb,
    'progress',(v_snapshot->'progress') || '{"credits":5,"room_progress":{},"active_session":null}'::jsonb,
    'daily','{"attempts_remaining":3,"lives_remaining":2}'::jsonb,'archives','[]'::jsonb,
    'money_lines',jsonb_build_array(
      jsonb_build_object('label','Rimozione premi con importo modificato','source_ids',jsonb_build_array(v_reward),'delta',-25,'defaultDelta',-30,'category_id','cura-corpo'),
      jsonb_build_object('label','Rimborso indizi','source_ids',jsonb_build_array(v_hint),'delta',10,'defaultDelta',10,'category_id','cura-corpo')));
  v_context := public.admin_apply_operation(v_admin,v_player,v_plan);
  if (v_context#>>'{snapshot,progress,credits}')::integer <> 5 then raise exception 'edited reset balance failed'; end if;
  if jsonb_array_length(v_context->'archives') <> 0 then raise exception 'archive cleanup failed'; end if;
  if (v_context#>>'{snapshot,daily_limits,lives_remaining}')::integer <> 2 then raise exception 'daily reset failed'; end if;
  if (select count(*) from public.player_credit_movements where access_code_id=v_player_id and kind='admin_adjustment' and delta=5) <> 1 then raise exception 'override audit failed'; end if;
  v_count := (select count(*) from public.player_credit_movements where access_code_id=v_player_id);
  perform public.admin_apply_operation(v_admin,v_player,v_plan);
  if (select count(*) from public.player_credit_movements where access_code_id=v_player_id) <> v_count then raise exception 'admin idempotency failed'; end if;
  v_revision := (v_context#>>'{snapshot,progress,state_revision}')::bigint;
  begin
    perform public.admin_apply_operation(v_admin,v_player,v_plan || jsonb_build_object('request_id',gen_random_uuid()));
    raise exception 'stale admin accepted';
  exception when others then if sqlerrm <> 'STALE_STATE' then raise; end if; end;
  begin
    perform public.admin_apply_operation(v_player,v_player,v_plan);
    raise exception 'player obtained admin rights';
  exception when others then if sqlerrm <> 'FORBIDDEN' then raise; end if; end;
  begin
    perform public.app_clear_room_archives(v_player);
    raise exception 'player cleared archives';
  exception when others then if sqlerrm <> 'FORBIDDEN' then raise; end if; end;
  begin
    perform public.app_save_snapshot(v_player,jsonb_build_object('state_revision',v_revision,'credits',5,'credit_movements','[]'::jsonb),'{"attempts_remaining":4}');
    raise exception 'player reset day';
  exception when others then if sqlerrm <> 'ADMIN_REQUIRED' then raise; end if; end;
  begin
    perform public.app_save_snapshot(v_player,jsonb_build_object('state_revision',v_revision-1,'credits',5),'{}');
    raise exception 'stale client accepted';
  exception when others then if sqlerrm <> 'STALE_STATE' then raise; end if; end;
  begin
    perform public.app_save_snapshot(v_player,'{"credits":5}','{}');
    raise exception 'legacy client undid admin intervention';
  exception when others then if sqlerrm <> 'STALE_STATE' then raise; end if; end;
  begin
    perform public.admin_apply_operation(v_admin,v_player,v_plan || jsonb_build_object('request_id',gen_random_uuid(),'expected_revision',v_revision,
      'progress',(v_plan->'progress')||'{"credits":-994}'::jsonb,
      'money_lines','[{"label":"Invalid","source_ids":[],"delta":-999}]'::jsonb));
    raise exception 'negative balance accepted';
  exception when others then if sqlerrm <> 'INVALID_BALANCE' then raise; end if; end;
  if (select count(*) from public.player_credit_movements where access_code_id=v_player_id) <> v_count then raise exception 'failed operation left partial ledger'; end if;
  if (select count(*) from public.player_admin_operations where access_code_id=v_player_id) <> 1 then raise exception 'failed operation left partial history'; end if;

  -- Restore the checkpoint, including previously reversed roots and archives.
  select coalesce(jsonb_agg(leaf->'id'),'[]'::jsonb) into v_sources
  from jsonb_array_elements(v_context->'leaves') leaf
  where leaf->>'kind' <> 'opening' and (leaf->>'is_effective')::boolean is distinct from coalesce((
    select (previous->>'is_effective')::boolean from jsonb_array_elements(v_before->'leaves') previous
    where previous->>'root_id'=leaf->>'root_id'),false);
  v_plan := jsonb_build_object('request_id',gen_random_uuid(),'expected_revision',v_revision,'title','Restore test','reason','Ripristino test',
    'settings','{"operation":"restore"}'::jsonb,'restore_operation_id',v_operation,
    'progress',v_before#>'{snapshot,progress}','daily',v_before#>'{snapshot,daily_limits}','archives',v_before->'archives',
    'money_lines',jsonb_build_array(jsonb_build_object('label','Restore','source_ids',v_sources,'delta',15,'defaultDelta',15)));
  v_context := public.admin_apply_operation(v_admin,v_player,v_plan);
  if (v_context#>>'{snapshot,progress,credits}')::integer <> 20 or jsonb_array_length(v_context->'archives') <> 1 then raise exception 'checkpoint restore failed'; end if;
  if v_context#>'{snapshot,progress,room_progress}' <> v_before#>'{snapshot,progress,room_progress}' then raise exception 'progress restore failed'; end if;

  -- Reverse a spend and restore it: history is append-only, leaf chains toggle.
  select leaf into v_leaf from jsonb_array_elements(v_context->'leaves') leaf where leaf->>'root_id'=v_hint::text;
  v_plan := jsonb_build_object('request_id',gen_random_uuid(),'expected_revision',v_context#>'{snapshot,progress,state_revision}',
    'title','Undo spend','reason','Verifica storno','settings','{}'::jsonb,'progress',(v_context#>'{snapshot,progress}')||'{"credits":30}'::jsonb,
    'daily',v_context#>'{snapshot,daily_limits}','archives',v_context->'archives',
    'money_lines',jsonb_build_array(jsonb_build_object('label','Undo','source_ids',jsonb_build_array(v_leaf->'id'),'delta',10)));
  v_context := public.admin_apply_operation(v_admin,v_player,v_plan);
  select leaf into v_leaf from jsonb_array_elements(v_context->'leaves') leaf where leaf->>'root_id'=v_hint::text;
  if (v_leaf->>'is_effective')::boolean then raise exception 'undo leaf not closed'; end if;
  v_plan := v_plan || jsonb_build_object('request_id',gen_random_uuid(),'expected_revision',v_context#>'{snapshot,progress,state_revision}',
    'progress',(v_context#>'{snapshot,progress}')||'{"credits":20}'::jsonb,
    'money_lines',jsonb_build_array(jsonb_build_object('label','Redo','source_ids',jsonb_build_array(v_leaf->'id'),'delta',-10)));
  v_context := public.admin_apply_operation(v_admin,v_player,v_plan);
  if (v_context#>>'{snapshot,progress,credits}')::integer <> 20 then raise exception 'redo balance failed'; end if;
  if (select sum(delta) from public.player_credit_movements where access_code_id=v_player_id) <> 20 then raise exception 'ledger does not reconcile'; end if;
  if has_table_privilege('anon','public.player_credit_movements','select') or has_table_privilege('anon','public.player_admin_operations','select') then raise exception 'private data exposed'; end if;
end $$;
rollback;
select 'PASS: rewards, spending, idempotency, edited reset, archives, permissions, stale clients, atomic rollback, checkpoint restore, movement undo/redo, ledger reconciliation; synthetic data rolled back' as verification;
