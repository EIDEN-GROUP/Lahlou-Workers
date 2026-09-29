// Single-admin session over HttpOnly signed cookie. No localStorage.
// Password verified with bcrypt against the DB hash first (set on first
// password reset), then ADMIN_PASSWORD_HASH, then ADMIN_PASSWORD (dev
// fallback, compared timing-safe). Session cookie is HMAC-signed with
// ADMIN_SESSION_SECRET.

import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const SESSION_COOKIE = "lahlou_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h

function secret(): string {
  const s = process.env["ADMIN_SESSION_SECRET"];
  if (!s || s.length < 32)
    throw new Error("Missing ADMIN_SESSION_SECRET (>=32 chars) - see .env.example");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function timingSafeCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const dbHash = await getDbPasswordHash().catch(() => null);
  if (dbHash) {
    try {
      return await bcrypt.compare(password, dbHash);
    } catch {
      return false;
    }
  }
  const hash = process.env["ADMIN_PASSWORD_HASH"];
  if (hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }
  const plain = process.env["ADMIN_PASSWORD"];
  if (!plain) throw new Error("Missing ADMIN_PASSWORD or ADMIN_PASSWORD_HASH - see .env.example");
  return timingSafeCompare(password, plain);
}

// DB-backed credential (written on password reset — env can't be rewritten
// at runtime). Returns null when Supabase or the table isn't configured.
export async function getDbPasswordHash(): Promise<string | null> {
  try {
    const { isSupabaseConfigured, getSupabaseAdmin } = await import("./supabase");
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await getSupabaseAdmin()
      .from("admin_settings")
      .select("value")
      .eq("key", "password_hash")
      .maybeSingle();
    if (error || !data) return null;
    const value = (data as { value?: unknown }).value;
    return typeof value === "string" && value.length > 20 ? value : null;
  } catch {
    return null;
  }
}

export async function setDbPasswordHash(hash: string): Promise<void> {
  const { getSupabaseAdmin } = await import("./supabase");
  const { error } = await getSupabaseAdmin()
    .from("admin_settings")
    .upsert({ key: "password_hash", value: hash, updated_at: new Date().toISOString() });
  if (error) throw new Error("Enregistrement impossible");
}

export function createSessionValue(): { value: string; expires: Date } {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `1.${exp}`;
  const sig = sign(payload);
  return { value: `${payload}.${sig}`, expires: new Date(exp) };
}

export function parseSessionCookie(header: string | null): boolean {
  if (!header) return false;
  const m = /(?:^|;\s*)lahlou_admin=([^;]+)/.exec(header);
  if (!m?.[1]) return false;
  const parts = decodeURIComponent(m[1]).split(".");
  if (parts.length !== 3) return false;
  const [flag, expStr, sig] = parts as [string, string, string];
  if (flag !== "1") return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = sign(`${flag}.${expStr}`);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function isAdminRequest(): boolean {
  try {
    const headers = getRequestHeaders() as unknown;
    const cookie =
      headers instanceof Headers
        ? headers.get("cookie")
        : ((headers as Record<string, string | string[] | undefined>)["cookie"] ?? null);
    const cookieStr = Array.isArray(cookie) ? (cookie[0] ?? null) : cookie;
    return parseSessionCookie(cookieStr);
  } catch {
    return false;
  }
}

export function sessionCookieHeader(value: string, expires: Date): string {
  const secure = process.env["NODE_ENV"] === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax${secure}; Expires=${expires.toUTCString()}; Max-Age=43200`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`;
}
