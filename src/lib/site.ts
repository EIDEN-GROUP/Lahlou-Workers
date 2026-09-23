// Central company identity — sourced from:
// - https://www.charika.ma/societe-lahlou-workers-1144714
// - https://tachrone.ma/fr/profil/lahlou-workers/4672
// - https://www.linkedin.com/company/lahlou-workersconstruction/
// - https://www.instagram.com/lahlou.workers/
//
// Phone is intentionally NOT hardcoded: Tachrone hides it behind login.
// Set PUBLIC_WHATSAPP_NUMBER (E.164 without +, e.g. 2126XXXXXXXX) in env.
// Falls back to empty -> WhatsApp button hidden until configured.

export const SITE = {
  name: "Lahlou Workers",
  legalName: "LAHLOU WORKERS SARL AU",
  tagline: "Construction haut de gamme depuis Agadir, partout au Maroc.",
  url: "https://lahlou-workers.com",
  locale: "fr-MA",
  lang: "fr",
  email: "lahlou.workers@gmail.com",
  // Keep legacy alias working too (mailto fallback list)
  emailAliases: ["contact@lahlou-workers.com"],
  address: {
    street: "N°118 Avenue Tanger, Hay Mohammedi, Appartement N°2 Étage 1",
    city: "Agadir",
    postalCode: "80000",
    region: "Souss-Massa",
    country: "Maroc",
    countryCode: "MA",
  },
  geo: { lat: 30.4278, lng: -9.5981 },
  ice: "003157258000059",
  rc: "053457",
  capital: "100 000 DHS",
  founded: "2022-12-07",
  hours: "Lun–Sam · 8h–18h",
  areas: [
    "Agadir",
    "Casablanca",
    "Marrakech",
    "Laâyoune",
    "Dakhla",
    "Tan-Tan",
    "Taroudant",
    "Inezgane",
  ],
  trades: [
    "Gros œuvre",
    "Second œuvre",
    "Aménagement de bureaux",
    "Génie civil et VRD",
    "Rénovation tous corps d’état",
  ],
  socials: {
    instagram: "https://www.instagram.com/lahlou.workers",
    linkedin: "https://www.linkedin.com/company/lahlou-workersconstruction",
    tachrone: "https://tachrone.ma/fr/profil/lahlou-workers/4672",
    charika: "https://www.charika.ma/societe-lahlou-workers-1144714",
  },
} as const;

export function whatsappLink(message?: string): string | null {
  const num = typeof process !== "undefined" ? (process.env["PUBLIC_WHATSAPP_NUMBER"] ?? "") : "";
  // Client-side fallback: Vite exposes VITE_ vars
  const clientNum =
    typeof import.meta !== "undefined"
      ? ((import.meta as unknown as { env?: Record<string, string> }).env?.[
          "VITE_WHATSAPP_NUMBER"
        ] ?? "")
      : "";
  const phone = (num || clientNum || "").replace(/\D/g, "");
  if (!phone) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${phone}${text}`;
}
