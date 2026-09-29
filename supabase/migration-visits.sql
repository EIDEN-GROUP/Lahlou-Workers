-- Lahlou Workers — visitor tracking migration.
-- Run in Supabase Dashboard > SQL editor (after supabase/schema.sql).
-- Privacy-friendly: only the visited path + timestamp, no IPs, no cookies,
-- no fingerprints. Rate limiting is in-memory on the server.

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  path text not null check (char_length(path) between 1 and 200)
);

create index if not exists visits_created_idx on public.visits (created_at desc);
create index if not exists visits_path_idx on public.visits (path);

alter table public.visits enable row level security;
-- No public policies: reads/writes go through the service_role server fns.
