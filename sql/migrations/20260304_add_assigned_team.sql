-- Add persistent assigned team field to reports.
-- Safe to run multiple times.

begin;

alter table public.reports
  add column if not exists assigned_team text;

create index if not exists reports_assigned_team_idx
  on public.reports (assigned_team);

commit;

