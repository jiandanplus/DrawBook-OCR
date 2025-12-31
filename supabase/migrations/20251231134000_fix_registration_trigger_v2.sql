-- FIX V2: Fail-Safe Registration Trigger
-- This script ensures user registration succeeds even if profile creation hits a snag.

-- 1. Grant Permissions (Crucial for trigger execution)
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on table public.profiles to postgres, service_role;

-- 2. Clean up potential duplicate triggers
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_signup on auth.users;

-- 3. Create a Robust, Fail-Safe Handler
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public -- Secure search path
as $$
begin
  -- Wrap in a block to catch errors
  begin
    insert into public.profiles (id, email, full_name, avatar_url, balance_pages)
    values (
      new.id,
      new.email,
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'avatar_url',
      coalesce((new.raw_user_meta_data->>'balance_pages')::int, 0)
    )
    on conflict (id) do update
    set
      email = excluded.email,
      updated_at = now();
      
  exception when others then
    -- IMPORTANT: Catch any error so we don't block the user registration!
    -- Log it to Postgres logs for admin to see
    raise warning 'Profile creation failed for user %: %', new.id, SQLERRM;
  end;
  
  return new;
end;
$$;

-- 4. Re-attach the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
