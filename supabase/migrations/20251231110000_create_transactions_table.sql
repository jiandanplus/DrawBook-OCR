-- Create transactions table
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  out_trade_no text unique not null,
  amount numeric(10, 2) not null, -- Stored in Yuan
  pages int not null,
  status text default 'pending', -- pending, success, failed
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table transactions enable row level security;

-- Policies
create policy "Users can view their own transactions"
  on transactions for select
  using (auth.uid() = user_id);

-- RPC for atomic balance update
create or replace function increment_balance_pages(p_user_id uuid, p_amount int)
returns void
language plpgsql
security definer
as $$
begin
  update profiles
  set balance_pages = coalesce(balance_pages, 0) + p_amount
  where id = p_user_id;
end;
$$;

