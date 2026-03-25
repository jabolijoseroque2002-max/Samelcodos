-- Function to update a report status while bypassing table RLS.
-- Safe to run multiple times.

begin;

create or replace function public.set_report_status(
  p_report_id bigint,
  p_status text,
  p_team_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_status text := lower(btrim(coalesce(p_status, '')));
  v_team_name text := nullif(btrim(coalesce(p_team_name, '')), '');
  v_result jsonb;
begin
  if p_report_id is null then
    raise exception 'Report ID is required';
  end if;

  if v_status not in ('pending', 'ontheway', 'resolved') then
    raise exception 'Invalid status "%"', p_status;
  end if;

  -- Validation for multiple teams is now handled by the application logic
  -- or we could split and check each, but for now we allow the update.

  update public.reports
  set
    status = v_status,
    resolved_at = case when v_status = 'resolved' then now() else null end,
    assigned_team = coalesce(v_team_name, assigned_team),
    updated_at = now()
  where id = p_report_id
  returning to_jsonb(reports.*) into v_result;

  if v_result is null then
    raise exception 'Report with ID % not found', p_report_id;
  end if;

  return v_result;
end;
$$;

grant execute on function public.set_report_status(bigint, text, text) to anon, authenticated;

commit;
