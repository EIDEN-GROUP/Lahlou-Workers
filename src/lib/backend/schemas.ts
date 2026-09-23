import { z } from "zod";

const name = z.string().trim().min(2).max(120);
const city = z.string().trim().min(2).max(80);
const phone = z
  .string()
  .trim()
  .min(6)
  .max(30)
  // Moroccan + international formats: digits, spaces, +, ., -, ()
  .regex(/^[+0-9][0-9\s.\-()]{5,29}$/, "Numéro de téléphone invalide");
const emailOptional = z
  .string()
  .trim()
  .max(160)
  .optional()
  .default("")
  .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), {
    message: "Email invalide",
  });
const emailRequired = z
  .string()
  .trim()
  .min(3)
  .max(160)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Email invalide");

const idSchema = z.string().trim().min(1).max(64);

export const contactSchema = z.object({
  name,
  phone,
  email: emailRequired,
  message: z.string().trim().min(10).max(5000),
  // honeypot — must stay empty
  company_website: z.string().max(200).optional().default(""),
});

export const devisSchema = z.object({
  need: z.enum(["Équipe seule", "Construction complète", "Finitions", "Rénovation"]),
  city,
  surface: z.string().trim().max(20).optional().default(""),
  startDate: z.string().trim().max(20).optional().default(""),
  duration: z.string().trim().max(60).optional().default(""),
  trades: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
  crewSize: z.coerce.number().int().min(1).max(500),
  name,
  company: z.string().trim().max(120).optional().default(""),
  phone,
  email: emailOptional,
  channel: z.enum(["WhatsApp", "Appel", "Email"]).optional().default("WhatsApp"),
  company_website: z.string().max(200).optional().default(""),
});

export const recruitSchema = z.object({
  name,
  trade: z.string().trim().min(2).max(80),
  experience: z.coerce.number().min(0).max(60),
  city,
  phone,
  company_website: z.string().max(200).optional().default(""),
});

const httpUrl = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (v) => v === "" || /^https:\/\//.test(v),
    "L’image doit être une URL https (ou un upload)",
  );

export const projectSchema = z.object({
  category: z.enum(["Résidentiel", "Commercial", "Industriel", "Rénovation"]),
  title: z.string().trim().min(3).max(140),
  city,
  year: z
    .string()
    .trim()
    .regex(/^(19|20)\d{2}$/, "Année invalide (ex. 2025)"),
  description: z.string().trim().min(10).max(2000),
  image: httpUrl,
});

export const idInput = z.object({ id: idSchema });
export const loginSchema = z.object({ password: z.string().min(1).max(200) });

export type ContactInput = z.infer<typeof contactSchema>;
export type DevisInput = z.infer<typeof devisSchema>;
export type RecruitInput = z.infer<typeof recruitSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
