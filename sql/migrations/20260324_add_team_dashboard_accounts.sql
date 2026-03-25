-- Adds team dashboard credentials and login RPCs.
-- Safe to run multiple times.

begin;

create extension if not exists pgcrypto with schema extensions;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  if to_jsonb(new) ? 'updated_at' then
    new := jsonb_populate_record(new, jsonb_build_object('updated_at', now()));
  end if;
  return new;
end;
$$;

alter table public.teams
  add column if not exists dashboard_email text,
  add column if not exists has_dashboard_login boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where indexname = 'teams_dashboard_email_unique_idx'
  ) then
    create unique index teams_dashboard_email_unique_idx
      on public.teams (lower(dashboard_email))
      where nullif(btrim(dashboard_email), '') is not null;
  end if;
end
$$;

update public.teams
set
  dashboard_email = lower(nullif(btrim(dashboard_email), '')),
  has_dashboard_login = case
    when nullif(btrim(dashboard_email), '') is not null then true
    else false
  end
where
  dashboard_email is distinct from lower(nullif(btrim(dashboard_email), ''))
  or has_dashboard_login is distinct from case
    when nullif(btrim(dashboard_email), '') is not null then true
    else false
  end;

create table if not exists public.team_dashboard_accounts (
  team_id bigint primary key,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

alter table public.team_dashboard_accounts
  add column if not exists team_id bigint,
  add column if not exists password_hash text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists last_login_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'team_dashboard_accounts_pkey'
  ) then
    alter table public.team_dashboard_accounts
      add constraint team_dashboard_accounts_pkey primary key (team_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'team_dashboard_accounts_team_id_fkey'
  ) then
    alter table public.team_dashboard_accounts
      add constraint team_dashboard_accounts_team_id_fkey
      foreign key (team_id) references public.teams(id) on delete cascade;
  end if;
end
$$;

alter table public.team_dashboard_accounts enable row level security;
revoke all on table public.team_dashboard_accounts from anon, authenticated;

create or replace function public.create_team_with_dashboard_account(
  p_name text,
  p_dashboard_email text,
  p_password text,
  p_description text default null
)
returns table (
  id bigint,
  name text,
  description text,
  is_active boolean,
  dashboard_email text,
  has_dashboard_login boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_name text := nullif(btrim(coalesce(p_name, '')), '');
  v_email text := lower(btrim(coalesce(p_dashboard_email, '')));
  v_description text := nullif(btrim(coalesce(p_description, '')), '');
  v_team public.teams%rowtype;
begin
  if v_name is null then
    raise exception 'Team name is required';
  end if;

  if v_email = '' or position('@' in v_email) = 0 then
    raise exception 'Valid dashboard email is required';
  end if;

  if length(coalesce(p_password, '')) < 8 then
    raise exception 'Dashboard password must be at least 8 characters';
  end if;

  if exists (
    select 1
    from public.teams t
    where lower(btrim(coalesce(t.name, ''))) = lower(v_name)
  ) then
    raise exception 'A team with this name already exists';
  end if;

  if exists (
    select 1
    from public.teams t
    where lower(btrim(coalesce(t.dashboard_email, ''))) = v_email
  ) then
    raise exception 'Dashboard email is already in use';
  end if;

  insert into public.teams (
    name,
    description,
    is_active,
    dashboard_email,
    has_dashboard_login
  )
  values (
    v_name,
    v_description,
    true,
    v_email,
    true
  )
  returning * into v_team;

  insert into public.team_dashboard_accounts (
    team_id,
    password_hash
  )
  values (
    v_team.id,
    extensions.crypt(p_password, extensions.gen_salt('bf', 10))
  );

  return query
  select
    v_team.id,
    v_team.name,
    v_team.description,
    v_team.is_active,
    v_team.dashboard_email,
    v_team.has_dashboard_login,
    v_team.created_at;
end;
$$;

create or replace function public.login_team_dashboard(
  p_email text,
  p_password text
)
returns table (
  team_id bigint,
  team_name text,
  dashboard_email text,
  description text,
  is_active boolean,
  created_at timestamptz,
  last_login_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_team_id bigint;
  v_team_name text;
  v_dashboard_email text;
  v_description text;
  v_is_active boolean;
  v_created_at timestamptz;
  v_password_hash text;
  v_last_login_at timestamptz;
begin
  if v_email = '' or coalesce(p_password, '') = '' then
    raise exception 'Invalid email or password';
  end if;

  select
    t.id,
    t.name,
    t.dashboard_email,
    t.description,
    t.is_active,
    t.created_at,
    a.password_hash,
    a.last_login_at
  into
    v_team_id,
    v_team_name,
    v_dashboard_email,
    v_description,
    v_is_active,
    v_created_at,
    v_password_hash,
    v_last_login_at
  from public.teams t
  inner join public.team_dashboard_accounts a
    on a.team_id = t.id
  where lower(btrim(coalesce(t.dashboard_email, ''))) = v_email
    and coalesce(t.has_dashboard_login, false) = true
  limit 1;

  if v_team_id is null then
    raise exception 'Invalid email or password';
  end if;

  if coalesce(v_is_active, false) = false then
    raise exception 'This team dashboard is inactive';
  end if;

  if v_password_hash is null
     or extensions.crypt(p_password, v_password_hash) <> v_password_hash then
    raise exception 'Invalid email or password';
  end if;

  update public.team_dashboard_accounts as tda
  set
    last_login_at = now(),
    updated_at = now()
  where tda.team_id = v_team_id
  returning tda.last_login_at into v_last_login_at;

  return query
  select
    v_team_id,
    v_team_name,
    v_dashboard_email,
    v_description,
    v_is_active,
    v_created_at,
    v_last_login_at;
end;
$$;

revoke all on function public.create_team_with_dashboard_account(text, text, text, text) from public;
revoke all on function public.login_team_dashboard(text, text) from public;

grant execute on function public.create_team_with_dashboard_account(text, text, text, text) to anon, authenticated;
grant execute on function public.login_team_dashboard(text, text) to anon, authenticated;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  if to_jsonb(new) ? 'updated_at' then
    new := jsonb_populate_record(new, jsonb_build_object('updated_at', now()));
  end if;
  return new;
end;
$$;

drop trigger if exists set_team_dashboard_accounts_updated_at on public.team_dashboard_accounts;

create trigger set_team_dashboard_accounts_updated_at
before update on public.team_dashboard_accounts
for each row
execute function public.update_updated_at_column();

commit;
