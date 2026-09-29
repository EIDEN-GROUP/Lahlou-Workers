-- Lahlou Workers — DB-backed admin password + one-time reset tokens.
-- Run in Supabase Dashboard > SQL editor.
-- The bootstrap hash in ADMIN_PASSWORD_HASH keeps working until the first
-- password reset, which stores the new hash here (env can't be rewritten
-- at runtime on Vercel).

create table if not exists public.admin_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_resets (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_resets_expires_idx on public.admin_resets (expires_at);

alter table public.admin_settings enable row level security;
alter table public.admin_resets enable row level security;
-- No public policies: reads/writes go through the service_role server fns.
