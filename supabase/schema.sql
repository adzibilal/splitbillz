-- Enable Row Level Security
alter table if exists bills enable row level security;
alter table if exists items enable row level security;
alter table if exists participants enable row level security;
alter table if exists assignments enable row level security;

-- Bills Table
create table bills (
  id uuid primary key default gen_random_uuid(),
  host_id uuid default auth.uid(),
  host_name text not null,
  restaurant_name text,
  status text default 'PENDING_OCR', -- PENDING_OCR, OPEN, REVIEW, FINALIZED
  tax_service_rate numeric default 10,
  payment_info jsonb,
  created_at timestamptz default now()
);

-- Items Table
create table items (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid references bills(id) on delete cascade,
  name text not null,
  price numeric not null,
  qty int default 1,
  created_at timestamptz default now()
);

-- Participants Table (Who joined the bill)
create table participants (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid references bills(id) on delete cascade,
  user_id uuid default auth.uid(),
  name text not null,
  has_paid boolean default false,
  joined_at timestamptz default now(),
  unique(bill_id, user_id)
);

-- Assignments Table (Who ordered what)
create table assignments (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references items(id) on delete cascade,
  user_id uuid default auth.uid(),
  quantity float default 1,
  created_at timestamptz default now()
);

-- RLS Policies
-- Bills: Readable by anyone (via shared link logic usually, but here public for MVP/Anon), Host can update
create policy "Bills are viewable by everyone" on bills
  for select using (true);

create policy "Bills are insertable by authenticated users" on bills
  for insert with check (true);

create policy "Bills are updateable by host" on bills
  for update using (auth.uid() = host_id);

-- Items: Readable by everyone, Insertable by Host (or via Bill logic)
create policy "Items are viewable by everyone" on items
  for select using (true);

create policy "Items are insertable by everyone" on items
  for insert with check (true);  -- Should be restricted to host/bill participants in production

create policy "Items are updateable by everyone" on items
  for update using (true); -- Simplified for MVP

create policy "Items are deletable by everyone" on items
  for delete using (true);

-- Participants
create policy "Participants are viewable by everyone" on participants
  for select using (true);

create policy "Participants insertable by everyone" on participants
  for insert with check (true);

create policy "Participants updateable by self or host" on participants
  for update using (true); -- Simplified

-- Assignments
create policy "Assignments viewable by everyone" on assignments
  for select using (true);

create policy "Assignments managed by everyone" on assignments
  for all using (true);
