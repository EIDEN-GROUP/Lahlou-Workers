// Server-only Supabase admin client (service_role). Never import from client code.
// Reads env at request time so Vercel env works without rebuild.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name} — see .env.example`);
  return v;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = required("SUPABASE_URL");
  const key = required("SUPABASE_SERVICE_ROLE_KEY");
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-client": "lahlou-workers-server" } },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_SERVICE_ROLE_KEY"]);
}
