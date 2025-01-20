-- Enable RLS (Row Level Security)
alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.notifications enable row level security;

-- Create tables
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  service_name text not null,
  amount decimal(10,2) not null,
  renewal_date date not null,
  frequency text not null check (frequency in ('monthly', 'yearly')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete cascade,
  notification_date date not null,
  status text default 'pending' check (status in ('pending', 'sent', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create policies
create policy "Users can view own profile"
  on public.users for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.users for update
  using ( auth.uid() = id );

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using ( auth.uid() = user_id );

create policy "Users can insert own subscriptions"
  on public.subscriptions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own subscriptions"
  on public.subscriptions for update
  using ( auth.uid() = user_id );

create policy "Users can delete own subscriptions"
  on public.subscriptions for delete
  using ( auth.uid() = user_id );

create policy "Users can view own notifications"
  on public.notifications for select
  using ( auth.uid() = user_id );

-- Create indexes
create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_subscription_id_idx on public.notifications(subscription_id);
