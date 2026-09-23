import { SITE } from "@/lib/site";

export const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  legalName: SITE.legalName,
  url: SITE.url,
  email: SITE.email,
  foundingDate: "2022-12-07",
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    postalCode: SITE.address.postalCode,
    addressRegion: SITE.address.region,
    addressCountry: SITE.address.countryCode,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: SITE.geo.lat,
    longitude: SITE.geo.lng,
  },
  areaServed: SITE.areas,
  sameAs: [SITE.socials.linkedin, SITE.socials.instagram, SITE.socials.tachrone],
  identifier: [
    { "@type": "PropertyValue", name: "ICE", value: SITE.ice },
    { "@type": "PropertyValue", name: "RC", value: SITE.rc },
  ],
  openingHours: "Mo-Sa 08:00-18:00",
  priceRange: "$$",
};

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: SITE.url,
    name: SITE.name,
    inLanguage: "fr-MA",
  };
}
