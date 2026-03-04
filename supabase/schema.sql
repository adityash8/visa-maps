-- Waitlist table for Visa Maps
create table if not exists waitlist (
  id bigint generated always as identity primary key,
  email text not null unique,
  created_at timestamptz default now()
);

-- Enable RLS
alter table waitlist enable row level security;

-- Allow anonymous inserts
create policy "Allow anonymous insert" on waitlist
  for insert with check (true);
