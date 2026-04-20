-- RPC to securely fetch a customer's email by their full name
-- Safe to run multiple times

begin;

create or replace function public.get_customer_email_by_name(
  p_full_name text
)
returns table (
  email text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select cu.email
  from public.customer_users cu
  where lower(cu.full_name) = lower(btrim(p_full_name))
    and cu.is_active = true
  limit 1;
end;
$$;

grant execute on function public.get_customer_email_by_name(text) to anon, authenticated;

commit;
