-- Migration: 20261120000002_admin_provisioning.sql
-- Ensure handle_new_user automatically assigns admin role for store owners

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    case
      when lower(new.email) in ('mahalakshmipulluru@gmail.com', 'admin@varnam.com') then 'admin'
      else 'customer'
    end
  )
  on conflict (id) do update set
    role = case
      when lower(excluded.email) in ('mahalakshmipulluru@gmail.com', 'admin@varnam.com') then 'admin'
      else public.profiles.role
    end;
  return new;
end;
$$;

-- Ensure profiles for admin users have admin role
update public.profiles
set role = 'admin'
where lower(email) in ('mahalakshmipulluru@gmail.com', 'admin@varnam.com');
