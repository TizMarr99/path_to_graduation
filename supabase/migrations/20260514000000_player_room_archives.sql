create table if not exists public.player_room_archives (
  access_code_id uuid not null references public.access_codes(id) on delete cascade,
  category_id text not null,
  summary jsonb not null default '{}'::jsonb,
  completed_snapshot jsonb not null default '{}'::jsonb,
  archive_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (access_code_id, category_id)
);

alter table public.player_room_archives enable row level security;

drop policy if exists "room archives are private to rpc" on public.player_room_archives;
create policy "room archives are private to rpc"
  on public.player_room_archives
  for all
  using (false)
  with check (false);

create or replace function public.app_save_room_archive(
  p_code text,
  p_category_id text,
  p_archive jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_snapshot jsonb;
  v_access_code_id uuid;
  v_summary jsonb;
  v_completed_snapshot jsonb;
begin
  v_snapshot := public.app_get_snapshot(p_code);
  v_access_code_id := (v_snapshot ->> 'access_code_id')::uuid;

  if v_access_code_id is null then
    raise exception 'INVALID_CODE';
  end if;

  v_summary := coalesce(p_archive -> 'summary', '{}'::jsonb);
  v_completed_snapshot := coalesce(p_archive -> 'completed_snapshot', '{}'::jsonb);

  insert into public.player_room_archives (
    access_code_id,
    category_id,
    summary,
    completed_snapshot,
    archive_version,
    updated_at
  )
  values (
    v_access_code_id,
    p_category_id,
    v_summary,
    v_completed_snapshot,
    coalesce((p_archive ->> 'archive_version')::integer, 1),
    now()
  )
  on conflict (access_code_id, category_id)
  do update set
    summary = excluded.summary,
    completed_snapshot = excluded.completed_snapshot,
    archive_version = excluded.archive_version,
    updated_at = now();

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.app_get_room_archive(
  p_code text,
  p_category_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_snapshot jsonb;
  v_access_code_id uuid;
  v_archive public.player_room_archives%rowtype;
begin
  v_snapshot := public.app_get_snapshot(p_code);
  v_access_code_id := (v_snapshot ->> 'access_code_id')::uuid;

  if v_access_code_id is null then
    raise exception 'INVALID_CODE';
  end if;

  select *
  into v_archive
  from public.player_room_archives
  where access_code_id = v_access_code_id
    and category_id = p_category_id;

  if not found then
    raise exception 'ROOM_ARCHIVE_NOT_FOUND';
  end if;

  return jsonb_build_object(
    'category_id', v_archive.category_id,
    'summary', v_archive.summary,
    'completed_snapshot', v_archive.completed_snapshot,
    'archive_version', v_archive.archive_version,
    'created_at', v_archive.created_at,
    'updated_at', v_archive.updated_at
  );
end;
$$;

create or replace function public.app_clear_room_archives(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_snapshot jsonb;
  v_access_code_id uuid;
begin
  v_snapshot := public.app_get_snapshot(p_code);
  v_access_code_id := (v_snapshot ->> 'access_code_id')::uuid;

  if v_access_code_id is null then
    raise exception 'INVALID_CODE';
  end if;

  delete from public.player_room_archives
  where access_code_id = v_access_code_id;

  return jsonb_build_object('ok', true);
end;
$$;
