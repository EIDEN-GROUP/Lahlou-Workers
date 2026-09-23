-- Lahlou Workers — Supabase schema (Postgres)
-- Run in Supabase SQL editor. RLS enabled; writes go through SERVICE_ROLE
-- from TanStack server fns, public read only for projects + project-images.

create extension if not exists "pgcrypto";

-- Contacts
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 6 and 30),
  email text not null check (char_length(email) between 3 and 160),
  message text not null check (char_length(message) between 10 and 5000)
);
create index if not exists contacts_created_idx on public.contacts (created_at desc);

-- Devis
create table if not exists public.devis (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  need text not null,
  city text not null,
  surface text not null default '',
  start_date text not null default '',
  duration text not null default '',
  trades text[] not null default '{}',
  crew_size int not null default 1 check (crew_size between 1 and 500),
  name text not null,
  company text not null default '',
  phone text not null,
  email text not null default '',
  channel text not null default 'WhatsApp'
);
create index if not exists devis_created_idx on public.devis (created_at desc);

-- Recruits
create table if not exists public.recruits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  trade text not null,
  experience numeric not null default 0 check (experience >= 0 and experience <= 60),
  city text not null,
  phone text not null
);
create index if not exists recruits_created_idx on public.recruits (created_at desc);

-- Projects (public read)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null check (category in ('Résidentiel','Commercial','Industriel','Rénovation')),
  title text not null,
  city text not null,
  year text not null,
  description text not null,
  image text not null
);
create index if not exists projects_created_idx on public.projects (created_at desc);

-- RLS
alter table public.contacts enable row level security;
alter table public.devis enable row level security;
alter table public.recruits enable row level security;
alter table public.projects enable row level security;

-- No public insert/select on PII tables (service_role bypasses RLS)
drop policy if exists "public read projects" on public.projects;
create policy "public read projects" on public.projects for select using (true);

-- Storage bucket for project images (create via Dashboard > Storage if not exists):
-- insert into storage.buckets (id, name, public) values ('project-images','project-images', true)
-- on conflict (id) do nothing;
--
-- Public read:
-- drop policy if exists "public read project-images" on storage.objects;
-- create policy "public read project-images" on storage.objects for select using (bucket_id = 'project-images');
-- Writes only via service_role (no insert policy for anon).
