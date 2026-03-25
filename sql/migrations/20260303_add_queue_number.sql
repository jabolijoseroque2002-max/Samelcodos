-- Add persistent queue numbering to reports.
-- Safe to run multiple times.

begin;

-- 1) Add queue_number column.
alter table public.reports
  add column if not exists queue_number bigint;

-- 2) Backfill queue_number for existing rows that don't have one yet.
--    Orders by earliest submission first (created_at, then id).
with ranked as (
  select
    id,
    row_number() over (
      order by
        coalesce(created_at, now()) asc,
        id asc
    ) as rn
  from public.reports
)
update public.reports r
set queue_number = ranked.rn
from ranked
where r.id = ranked.id
  and r.queue_number is null;

-- 3) Create a sequence and set it to continue after current max queue number.
create sequence if not exists public.reports_queue_number_seq;

select setval(
  'public.reports_queue_number_seq',
  coalesce((select max(queue_number) from public.reports), 0),
  true
);

-- 4) Make queue_number auto-assign for future inserts when not explicitly provided.
alter table public.reports
  alter column queue_number set default nextval('public.reports_queue_number_seq');

-- 5) Enforce required + unique queue number.
alter table public.reports
  alter column queue_number set not null;

create unique index if not exists reports_queue_number_unique_idx
  on public.reports (queue_number);

commit;
