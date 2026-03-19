-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ========================================
-- TODOS TABLE
-- ========================================
create table public.todos (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  description   text,
  status        text not null default 'todo' check (status in ('todo', 'done', 'cancel')),
  priority      smallint not null default 2 check (priority in (1, 2, 3)),
  due_date      timestamptz,
  reminder_at   timestamptz,
  reminder_sent boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Indexes
create index idx_todos_user_id on public.todos(user_id);
create index idx_todos_due_date on public.todos(user_id, due_date)
  where due_date is not null;
create index idx_todos_reminder on public.todos(reminder_at)
  where reminder_at is not null and reminder_sent = false;

-- ========================================
-- UPDATED_AT TRIGGER
-- ========================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.todos
  for each row execute function public.handle_updated_at();

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================
alter table public.todos enable row level security;

create policy "Users can select own todos"
  on public.todos for select
  using (auth.uid() = user_id);

create policy "Users can insert own todos"
  on public.todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own todos"
  on public.todos for update
  using (auth.uid() = user_id);

create policy "Users can delete own todos"
  on public.todos for delete
  using (auth.uid() = user_id);
