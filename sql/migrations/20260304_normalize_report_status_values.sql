-- Normalize and constrain report status values.
-- Allowed values: pending, ontheway, resolved.
-- Safe to run multiple times.

begin;

-- 1) Normalize legacy/misspelled values.
update public.reports
set status = 'resolved'
where lower(coalesce(status, '')) in ('resolve', 'reolve', 'resolved');

update public.reports
set status = 'ontheway'
where lower(coalesce(status, '')) in ('on the way', 'on_the_way', 'onway', 'ontheway');

update public.reports
set status = 'pending'
where status is null
   or lower(status) not in ('pending', 'ontheway', 'resolved');

-- 2) Set default status.
alter table public.reports
  alter column status set default 'pending';

-- 3) Enforce allowed status values.
alter table public.reports
  drop constraint if exists reports_status_check;

alter table public.reports
  add constraint reports_status_check
  check (status in ('pending', 'ontheway', 'resolved'));

commit;

