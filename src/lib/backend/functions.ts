import { createServerFn } from "@tanstack/react-start";
import { listItems, appendItem, deleteItem, makeId } from "@/lib/backend/store";

// Simple shared password for the admin dashboard preview. Not meant for real
// production use — see the note on the login route.
const ADMIN_PASSWORD = "lahlou2026";

export type ContactSubmission = { id: string; createdAt: string; name: string; phone: string; email: string; message: string };
export type DevisSubmission = {
  id: string; createdAt: string; need: string; city: string; surface: string; startDate: string; duration: string;
  trades: string[]; crewSize: number; name: string; company: string; phone: string; email: string; channel: string;
};
export type RecruitSubmission = { id: string; createdAt: string; name: string; trade: string; experience: string; city: string; phone: string };
export type AdminProject = { id: string; createdAt: string; category: string; title: string; city: string; year: string; description: string; image: string };

export const login = createServerFn({ method: "POST" })
  .validator((data: { password: string }) => data)
  .handler(async ({ data }) => ({ ok: data.password === ADMIN_PASSWORD }));

// --- Contacts ---
export const submitContact = createServerFn({ method: "POST" })
  .validator((data: { name: string; phone: string; email: string; message: string }) => data)
  .handler(async ({ data }) => appendItem<ContactSubmission>("contacts", { id: makeId(), createdAt: new Date().toISOString(), ...data }));

export const listContacts = createServerFn({ method: "GET" }).handler(async () => listItems<ContactSubmission>("contacts"));
export const deleteContact = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => deleteItem("contacts", data.id));

// --- Devis ---
export const submitDevis = createServerFn({ method: "POST" })
  .validator((data: Omit<DevisSubmission, "id" | "createdAt">) => data)
  .handler(async ({ data }) => appendItem<DevisSubmission>("devis", { id: makeId(), createdAt: new Date().toISOString(), ...data }));

export const listDevis = createServerFn({ method: "GET" }).handler(async () => listItems<DevisSubmission>("devis"));
export const deleteDevis = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => deleteItem("devis", data.id));

// --- Recruitment ---
export const submitRecruit = createServerFn({ method: "POST" })
  .validator((data: { name: string; trade: string; experience: string; city: string; phone: string }) => data)
  .handler(async ({ data }) => appendItem<RecruitSubmission>("recruits", { id: makeId(), createdAt: new Date().toISOString(), ...data }));

export const listRecruits = createServerFn({ method: "GET" }).handler(async () => listItems<RecruitSubmission>("recruits"));
export const deleteRecruit = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => deleteItem("recruits", data.id));

// --- Projects (admin-added, merged into the public Projets page) ---
export const submitProject = createServerFn({ method: "POST" })
  .validator((data: { category: string; title: string; city: string; year: string; description: string; image: string }) => data)
  .handler(async ({ data }) => appendItem<AdminProject>("projects", { id: makeId(), createdAt: new Date().toISOString(), ...data }));

export const listProjects = createServerFn({ method: "GET" }).handler(async () => listItems<AdminProject>("projects"));
export const deleteProject = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => deleteItem("projects", data.id));
