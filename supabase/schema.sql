-- ============================================================
-- Âncora - Full Supabase Schema
-- Personal life regulation app based on DBT/ACT therapy
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================
create type habit_frequency as enum ('daily', 'weekdays', 'custom');
create type habit_log_version as enum ('ideal', 'minimum', 'skipped');
create type focus_session_status as enum ('active', 'completed', 'abandoned');
create type impulse_type as enum (
  'smoking',
  'social_media',
  'pornography',
  'binge_eating',
  'substance',
  'other'
);

-- ============================================================
-- TABLES
-- ============================================================

-- Users (extends Supabase auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  values text[] not null default '{}',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Daily check-ins
create table check_ins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  energy smallint not null check (energy between 1 and 5),
  mood smallint not null check (mood between 1 and 5),
  anxiety smallint not null check (anxiety between 1 and 5),
  focus smallint not null check (focus between 1 and 5),
  impulsivity smallint not null check (impulsivity between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),

  unique (user_id, date)
);

-- Identities (e.g. "Estudioso equilibrado", "Não fumante em construção")
create table identities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  description text,
  icon text,
  active boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Habits linked to identities
create table habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  identity_id uuid not null references identities(id) on delete cascade,
  name text not null,
  ideal_version text not null,
  minimum_version text not null,
  common_saboteurs text[] not null default '{}',
  frequency habit_frequency not null default 'daily',
  custom_days smallint[],
  active boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Habit completion logs
create table habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  version habit_log_version not null,
  notes text,
  created_at timestamptz not null default now(),

  unique (habit_id, date)
);

-- Day priorities (max 3 per day enforced at app level)
create table day_priorities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  text text not null,
  completed boolean not null default false,
  order_index smallint not null default 0 check (order_index between 0 and 2),
  created_at timestamptz not null default now()
);

-- Focus sessions
create table focus_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  objective text not null,
  duration_planned integer not null check (duration_planned > 0),
  duration_actual integer,
  started_at timestamptz not null,
  ended_at timestamptz,
  status focus_session_status not null default 'active',
  review_focus smallint check (review_focus is null or review_focus between 1 and 5),
  review_progress text,
  review_notes text,
  created_at timestamptz not null default now()
);

-- Impulse logs
create table impulses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type impulse_type not null,
  intensity smallint not null check (intensity between 1 and 10),
  trigger text,
  context text,
  emotion_before text,
  technique_used text,
  resisted boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

-- Weekly reviews
create table weekly_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  week_start date not null,
  patterns text,
  triggers text,
  adjustments text,
  wins text,
  ai_insights text,
  created_at timestamptz not null default now(),

  unique (user_id, week_start)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Check-ins: query by user + date range
create index idx_check_ins_user_date on check_ins (user_id, date desc);

-- Identities: ordered listing per user
create index idx_identities_user_order on identities (user_id, order_index);

-- Habits: listing by identity
create index idx_habits_identity on habits (identity_id, order_index);
create index idx_habits_user on habits (user_id);

-- Habit logs: query by user + date range
create index idx_habit_logs_user_date on habit_logs (user_id, date desc);
create index idx_habit_logs_habit_date on habit_logs (habit_id, date desc);

-- Day priorities: query by user + date
create index idx_day_priorities_user_date on day_priorities (user_id, date desc);

-- Focus sessions: query by user + status
create index idx_focus_sessions_user on focus_sessions (user_id, created_at desc);
create index idx_focus_sessions_status on focus_sessions (user_id, status);

-- Impulses: query by user + date range
create index idx_impulses_user_created on impulses (user_id, created_at desc);
create index idx_impulses_type on impulses (user_id, type);

-- Weekly reviews: query by user + week
create index idx_weekly_reviews_user_week on weekly_reviews (user_id, week_start desc);

-- ============================================================
-- UPDATED_AT TRIGGER (for users table)
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on users
  for each row
  execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table check_ins enable row level security;
alter table identities enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table day_priorities enable row level security;
alter table focus_sessions enable row level security;
alter table impulses enable row level security;
alter table weekly_reviews enable row level security;

-- Users: can only read/update own profile
create policy "Users can view own profile"
  on users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on users for insert
  with check (auth.uid() = id);

-- Check-ins: user can only access own data
create policy "Users can view own check-ins"
  on check_ins for select
  using (auth.uid() = user_id);

create policy "Users can insert own check-ins"
  on check_ins for insert
  with check (auth.uid() = user_id);

create policy "Users can update own check-ins"
  on check_ins for update
  using (auth.uid() = user_id);

create policy "Users can delete own check-ins"
  on check_ins for delete
  using (auth.uid() = user_id);

-- Identities
create policy "Users can view own identities"
  on identities for select
  using (auth.uid() = user_id);

create policy "Users can insert own identities"
  on identities for insert
  with check (auth.uid() = user_id);

create policy "Users can update own identities"
  on identities for update
  using (auth.uid() = user_id);

create policy "Users can delete own identities"
  on identities for delete
  using (auth.uid() = user_id);

-- Habits
create policy "Users can view own habits"
  on habits for select
  using (auth.uid() = user_id);

create policy "Users can insert own habits"
  on habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own habits"
  on habits for update
  using (auth.uid() = user_id);

create policy "Users can delete own habits"
  on habits for delete
  using (auth.uid() = user_id);

-- Habit logs
create policy "Users can view own habit logs"
  on habit_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own habit logs"
  on habit_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own habit logs"
  on habit_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own habit logs"
  on habit_logs for delete
  using (auth.uid() = user_id);

-- Day priorities
create policy "Users can view own priorities"
  on day_priorities for select
  using (auth.uid() = user_id);

create policy "Users can insert own priorities"
  on day_priorities for insert
  with check (auth.uid() = user_id);

create policy "Users can update own priorities"
  on day_priorities for update
  using (auth.uid() = user_id);

create policy "Users can delete own priorities"
  on day_priorities for delete
  using (auth.uid() = user_id);

-- Focus sessions
create policy "Users can view own focus sessions"
  on focus_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own focus sessions"
  on focus_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own focus sessions"
  on focus_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own focus sessions"
  on focus_sessions for delete
  using (auth.uid() = user_id);

-- Impulses
create policy "Users can view own impulses"
  on impulses for select
  using (auth.uid() = user_id);

create policy "Users can insert own impulses"
  on impulses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own impulses"
  on impulses for update
  using (auth.uid() = user_id);

create policy "Users can delete own impulses"
  on impulses for delete
  using (auth.uid() = user_id);

-- Weekly reviews
create policy "Users can view own weekly reviews"
  on weekly_reviews for select
  using (auth.uid() = user_id);

create policy "Users can insert own weekly reviews"
  on weekly_reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weekly reviews"
  on weekly_reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete own weekly reviews"
  on weekly_reviews for delete
  using (auth.uid() = user_id);
