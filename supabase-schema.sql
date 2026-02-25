-- Night Notes Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  timezone text default 'Europe/London',
  morning_email_enabled boolean default true,
  evening_reminder_enabled boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Sessions (each shutdown ritual)
create table if not exists public.sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  load_before integer check (load_before >= 1 and load_before <= 5),
  load_after integer check (load_after >= 1 and load_after <= 5),
  open_loops text,
  emotional_residue text,
  tomorrow_anchor text,
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  duration_seconds integer,
  load_delta integer generated always as (load_before - load_after) stored,
  created_at timestamptz default now() not null
);

-- Morning check-ins
create table if not exists public.morning_checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  session_id uuid references public.sessions on delete set null,
  sharpness integer check (sharpness >= 1 and sharpness <= 5),
  created_at timestamptz default now() not null
);

-- Weekly analyses
create table if not exists public.weekly_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  week_start date not null,
  week_end date not null,
  total_sessions integer,
  avg_load_drop numeric(3,2),
  avg_sharpness numeric(3,2),
  patterns jsonb,
  insights text,
  common_themes jsonb,
  created_at timestamptz default now() not null,
  unique(user_id, week_start)
);

-- Streaks
create table if not exists public.streaks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null unique,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_session_date date,
  updated_at timestamptz default now() not null
);

-- Indexes
create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists sessions_completed_at_idx on public.sessions(completed_at desc);
create index if not exists morning_checkins_user_id_idx on public.morning_checkins(user_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.morning_checkins enable row level security;
alter table public.weekly_analyses enable row level security;
alter table public.streaks enable row level security;

-- Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view own sessions" on public.sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on public.sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on public.sessions for update using (auth.uid() = user_id);

create policy "Users can view own checkins" on public.morning_checkins for select using (auth.uid() = user_id);
create policy "Users can insert own checkins" on public.morning_checkins for insert with check (auth.uid() = user_id);

create policy "Users can view own analyses" on public.weekly_analyses for select using (auth.uid() = user_id);
create policy "Users can insert own analyses" on public.weekly_analyses for insert with check (auth.uid() = user_id);

create policy "Users can view own streaks" on public.streaks for select using (auth.uid() = user_id);
create policy "Users can update own streaks" on public.streaks for update using (auth.uid() = user_id);
create policy "Users can insert own streaks" on public.streaks for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  insert into public.streaks (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update streak after session
create or replace function public.update_streak_after_session()
returns trigger as $$
declare
  current_date_val date;
  last_date date;
  current_streak_val integer;
  longest_streak_val integer;
begin
  current_date_val := (new.completed_at at time zone 'UTC')::date;
  
  select last_session_date, current_streak, longest_streak
  into last_date, current_streak_val, longest_streak_val
  from public.streaks where user_id = new.user_id;
  
  if last_date is null or current_date_val > last_date then
    if last_date is null or current_date_val = last_date + interval '1 day' then
      current_streak_val := coalesce(current_streak_val, 0) + 1;
    elsif current_date_val > last_date + interval '1 day' then
      current_streak_val := 1;
    end if;
    
    if current_streak_val > coalesce(longest_streak_val, 0) then
      longest_streak_val := current_streak_val;
    end if;
    
    update public.streaks set
      current_streak = current_streak_val,
      longest_streak = longest_streak_val,
      last_session_date = current_date_val,
      updated_at = now()
    where user_id = new.user_id;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_session_completed on public.sessions;
create trigger on_session_completed
  after insert on public.sessions
  for each row when (new.completed_at is not null)
  execute procedure public.update_streak_after_session();
