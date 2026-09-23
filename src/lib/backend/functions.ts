// Production backend: Supabase (Postgres) + zod validation + single-admin
// cookie session + rate-limit + nodemailer notifications.
// Server-only modules are lazy-imported inside handlers so the client bundle
// never includes service keys / node:crypto / nodemailer.

import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";
import {
  contactSchema,
  devisSchema,
  idInput,
  loginSchema,
  projectSchema,
  recruitSchema,
} from "@/lib/backend/schemas";

export type ContactSubmission = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  message: string;
};
export type DevisSubmission = {
  id: string;
  createdAt: string;
  need: string;
  city: string;
  surface: string;
  startDate: string;
  duration: string;
  trades: string[];
  crewSize: number;
  name: string;
  company: string;
  phone: string;
  email: string;
  channel: string;
};
export type RecruitSubmission = {
  id: string;
  createdAt: string;
  name: string;
  trade: string;
  experience: string;
  city: string;
  phone: string;
};
export type AdminProject = {
  id: string;
  createdAt: string;
  category: string;
  title: string;
  city: string;
  year: string;
  description: string;
  image: string;
};

type Row = {
  id?: unknown;
  created_at?: unknown;
  createdAt?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  message?: unknown;
  need?: unknown;
  city?: unknown;
  surface?: unknown;
  start_date?: unknown;
  startDate?: unknown;
  duration?: unknown;
  trades?: unknown;
  crew_size?: unknown;
  crewSize?: unknown;
  company?: unknown;
  channel?: unknown;
  trade?: unknown;
  experience?: unknown;
  category?: unknown;
  title?: unknown;
  year?: unknown;
  description?: unknown;
  image?: unknown;
};

function toContact(r: Row): ContactSubmission {
  return {
    id: String(r.id),
    createdAt: String(r.created_at ?? r.createdAt ?? new Date().toISOString()),
    name: String(r.name ?? ""),
    phone: String(r.phone ?? ""),
    email: String(r.email ?? ""),
    message: String(r.message ?? ""),
  };
}
function toDevis(r: Row): DevisSubmission {
  return {
    id: String(r.id),
    createdAt: String(r.created_at ?? r.createdAt ?? new Date().toISOString()),
    need: String(r.need ?? ""),
    city: String(r.city ?? ""),
    surface: String(r.surface ?? ""),
    startDate: String(r.start_date ?? r.startDate ?? ""),
    duration: String(r.duration ?? ""),
    trades: (r.trades as string[]) ?? [],
    crewSize: Number(r.crew_size ?? r.crewSize ?? 0),
    name: String(r.name ?? ""),
    company: String(r.company ?? ""),
    phone: String(r.phone ?? ""),
    email: String(r.email ?? ""),
    channel: String(r.channel ?? ""),
  };
}
function toRecruit(r: Row): RecruitSubmission {
  return {
    id: String(r.id),
    createdAt: String(r.created_at ?? r.createdAt ?? new Date().toISOString()),
    name: String(r.name ?? ""),
    trade: String(r.trade ?? ""),
    experience: String(r.experience ?? ""),
    city: String(r.city ?? ""),
    phone: String(r.phone ?? ""),
  };
}
function toProject(r: Row): AdminProject {
  return {
    id: String(r.id),
    createdAt: String(r.created_at ?? r.createdAt ?? new Date().toISOString()),
    category: String(r.category ?? ""),
    title: String(r.title ?? ""),
    city: String(r.city ?? ""),
    year: String(r.year ?? ""),
    description: String(r.description ?? ""),
    image: String(r.image ?? ""),
  };
}

async function requestIp(): Promise<string> {
  try {
    const mod = (await import("@tanstack/react-start/server")) as unknown as {
      getRequestHeaders?: () => Headers | Record<string, string>;
    };
    const h = mod.getRequestHeaders?.();
    const headers = h instanceof Headers ? h : new Headers(h as Record<string, string>);
    const { clientIpFromHeaders } = await import("@/lib/backend/rate-limit");
    return clientIpFromHeaders(headers);
  } catch {
    return "unknown";
  }
}

async function checkRate(key: string, limit: number): Promise<void> {
  const { ensureEnv } = await import("@/lib/backend/env");
  await ensureEnv();
  const { rateLimit } = await import("@/lib/backend/rate-limit");
  if (!rateLimit(`${await requestIp()}:${key}`, limit, 60_000)) {
    throw new Error("Trop de requêtes. Réessayez dans une minute.");
  }
}

async function requireAdmin(): Promise<void> {
  const { ensureEnv } = await import("@/lib/backend/env");
  await ensureEnv();
  const { isAdminRequest } = await import("@/lib/backend/auth");
  if (!isAdminRequest()) throw new Error("Non autorisé");
}

function jsonWithCookie(data: unknown, cookie: string): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "set-cookie": cookie,
    },
  });
}

// --- Auth (single admin) ---
export const login = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => loginSchema.parse(d))
  .handler(async ({ data }) => {
    await checkRate("login", 5);
    const { verifyPassword, createSessionValue, sessionCookieHeader } =
      await import("@/lib/backend/auth");
    const ok = await verifyPassword(data.password);
    if (!ok) {
      await new Promise((r) => setTimeout(r, 400));
      return { ok: false as const };
    }
    const { value, expires } = createSessionValue();
    return jsonWithCookie({ ok: true as const }, sessionCookieHeader(value, expires));
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const { clearSessionCookieHeader } = await import("@/lib/backend/auth");
  return jsonWithCookie({ ok: true as const }, clearSessionCookieHeader());
});

export const adminMe = createServerFn({ method: "GET" }).handler(async () => {
  const { ensureEnv } = await import("@/lib/backend/env");
  await ensureEnv();
  const { isAdminRequest } = await import("@/lib/backend/auth");
  return { authed: isAdminRequest() };
});

// --- Contacts ---
export const submitContact = createServerFn({ method: "POST" })
  .validator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    await checkRate("contact", 8);
    if (data.company_website) return { ok: true as const };
    const { isSupabaseConfigured, getSupabaseAdmin } = await import("@/lib/backend/supabase");
    if (!isSupabaseConfigured()) throw new Error("Base de données non configurée");
    const db = getSupabaseAdmin();
    const id = randomUUID();
    const { error } = await db.from("contacts").insert({
      id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      message: data.message,
    });
    if (error) throw new Error("Enregistrement impossible");
    const { notifyAdmin } = await import("@/lib/backend/mailer");
    void notifyAdmin(
      `Nouveau message - ${data.name}`,
      [
        ["Nom", data.name],
        ["Téléphone", data.phone],
        ["Email", data.email],
        ["Message", data.message],
      ],
      "Message reçu",
    );
    return { ok: true as const, id };
  });

export const listContacts = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { isSupabaseConfigured, getSupabaseAdmin } = await import("@/lib/backend/supabase");
  if (!isSupabaseConfigured()) return [] as ContactSubmission[];
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error("Lecture impossible");
  return (data as Row[]).map(toContact);
});

export const deleteContact = createServerFn({ method: "POST" })
  .validator((d: unknown) => idInput.parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSupabaseAdmin } = await import("@/lib/backend/supabase");
    const db = getSupabaseAdmin();
    const { error } = await db.from("contacts").delete().eq("id", data.id);
    if (error) throw new Error("Suppression impossible");
    return { ok: true as const };
  });

// --- Devis ---
export const submitDevis = createServerFn({ method: "POST" })
  .validator((d: unknown) => devisSchema.parse(d))
  .handler(async ({ data }) => {
    await checkRate("devis", 8);
    if (data.company_website) return { ok: true as const };
    const { isSupabaseConfigured, getSupabaseAdmin } = await import("@/lib/backend/supabase");
    if (!isSupabaseConfigured()) throw new Error("Base de données non configurée");
    const db = getSupabaseAdmin();
    const id = randomUUID();
    const { error } = await db.from("devis").insert({
      id,
      need: data.need,
      city: data.city,
      surface: data.surface,
      start_date: data.startDate,
      duration: data.duration,
      trades: data.trades,
      crew_size: data.crewSize,
      name: data.name,
      company: data.company,
      phone: data.phone,
      email: data.email,
      channel: data.channel,
    });
    if (error) throw new Error("Enregistrement impossible");
    const { notifyAdmin } = await import("@/lib/backend/mailer");
    void notifyAdmin(
      `Nouvelle demande de devis - ${data.name} (${data.city})`,
      [
        ["Besoin", data.need],
        ["Ville", data.city],
        ["Surface", data.surface],
        ["Métiers", data.trades.join(", ")],
        ["Équipe", String(data.crewSize)],
        ["Nom", data.name],
        ["Téléphone", data.phone],
        ["Canal", data.channel],
      ],
      "Demande de devis",
    );
    return { ok: true as const, id };
  });

export const listDevis = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { isSupabaseConfigured, getSupabaseAdmin } = await import("@/lib/backend/supabase");
  if (!isSupabaseConfigured()) return [] as DevisSubmission[];
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("devis")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error("Lecture impossible");
  return (data as Row[]).map(toDevis);
});

export const deleteDevis = createServerFn({ method: "POST" })
  .validator((d: unknown) => idInput.parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSupabaseAdmin } = await import("@/lib/backend/supabase");
    const db = getSupabaseAdmin();
    const { error } = await db.from("devis").delete().eq("id", data.id);
    if (error) throw new Error("Suppression impossible");
    return { ok: true as const };
  });

// --- Recrutement ---
export const submitRecruit = createServerFn({ method: "POST" })
  .validator((d: unknown) => recruitSchema.parse(d))
  .handler(async ({ data }) => {
    await checkRate("recruit", 8);
    if (data.company_website) return { ok: true as const };
    const { isSupabaseConfigured, getSupabaseAdmin } = await import("@/lib/backend/supabase");
    if (!isSupabaseConfigured()) throw new Error("Base de données non configurée");
    const db = getSupabaseAdmin();
    const id = randomUUID();
    const { error } = await db.from("recruits").insert({
      id,
      name: data.name,
      trade: data.trade,
      experience: data.experience,
      city: data.city,
      phone: data.phone,
    });
    if (error) throw new Error("Enregistrement impossible");
    const { notifyAdmin } = await import("@/lib/backend/mailer");
    void notifyAdmin(
      `Nouvelle candidature - ${data.name} (${data.trade})`,
      [
        ["Nom", data.name],
        ["Métier", data.trade],
        ["Expérience", `${data.experience} ans`],
        ["Ville", data.city],
        ["Téléphone", data.phone],
      ],
      "Candidature reçue",
    );
    return { ok: true as const, id };
  });

export const listRecruits = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { isSupabaseConfigured, getSupabaseAdmin } = await import("@/lib/backend/supabase");
  if (!isSupabaseConfigured()) return [] as RecruitSubmission[];
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("recruits")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error("Lecture impossible");
  return (data as Row[]).map(toRecruit);
});

export const deleteRecruit = createServerFn({ method: "POST" })
  .validator((d: unknown) => idInput.parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSupabaseAdmin } = await import("@/lib/backend/supabase");
    const db = getSupabaseAdmin();
    const { error } = await db.from("recruits").delete().eq("id", data.id);
    if (error) throw new Error("Suppression impossible");
    return { ok: true as const };
  });

// --- Projets ---
export const submitProject = createServerFn({ method: "POST" })
  .validator((d: unknown) => projectSchema.parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSupabaseAdmin } = await import("@/lib/backend/supabase");
    const db = getSupabaseAdmin();
    const id = randomUUID();
    const { error } = await db.from("projects").insert({
      id,
      category: data.category,
      title: data.title,
      city: data.city,
      year: data.year,
      description: data.description,
      image: data.image,
    });
    if (error) throw new Error("Enregistrement impossible");
    return { ok: true as const, id };
  });

export const listProjects = createServerFn({ method: "GET" }).handler(async () => {
  const { ensureEnv } = await import("@/lib/backend/env");
  await ensureEnv();
  const { isSupabaseConfigured, getSupabaseAdmin } = await import("@/lib/backend/supabase");
  if (!isSupabaseConfigured()) return [] as AdminProject[];
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return [] as AdminProject[];
  return (data as Row[]).map(toProject);
});

export const deleteProject = createServerFn({ method: "POST" })
  .validator((d: unknown) => idInput.parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { getSupabaseAdmin } = await import("@/lib/backend/supabase");
    const db = getSupabaseAdmin();
    const { error } = await db.from("projects").delete().eq("id", data.id);
    if (error) throw new Error("Suppression impossible");
    return { ok: true as const };
  });

// --- Upload image projet vers Supabase Storage (admin) ---
// Tout upload est normalisé en WebP (max 1920px, qualité 82) via sharp :
// fichiers légers, format unique, chargement rapide sur /realisations.
export const uploadProjectImage = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { dataUrl?: string; filename?: string })
  .handler(async ({ data }) => {
    await requireAdmin();
    const { dataUrl, filename } = data as { dataUrl?: string; filename?: string };
    if (!dataUrl || !/^data:image\/(jpeg|png|webp);base64,/.test(dataUrl)) {
      throw new Error("Format d’image invalide (jpeg/png/webp attendus)");
    }
    const base64 = dataUrl.split(",")[1] ?? "";
    const buf = Buffer.from(base64, "base64");
    if (buf.length > 8 * 1024 * 1024) throw new Error("Image trop lourde (max 8 Mo)");
    const { default: sharp } = await import("sharp");
    let webp: Buffer;
    try {
      webp = await sharp(buf)
        .rotate()
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    } catch {
      throw new Error("Image illisible");
    }
    const { getSupabaseAdmin } = await import("@/lib/backend/supabase");
    const supabase = getSupabaseAdmin();
    const safe = (filename ?? "projet")
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .slice(0, 60);
    const path = `projects/${randomUUID()}-${safe || "projet"}.webp`;
    const { error } = await supabase.storage
      .from("project-images")
      .upload(path, webp, { contentType: "image/webp", upsert: false });
    if (error) throw new Error("Upload impossible - vérifiez le bucket project-images");
    const { data: pub } = supabase.storage.from("project-images").getPublicUrl(path);
    return { ok: true as const, url: pub.publicUrl };
  });
