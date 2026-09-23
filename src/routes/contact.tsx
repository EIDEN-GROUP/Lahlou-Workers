import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { User, Phone, Mail, MessageSquare, Check } from "lucide-react";
import { SplitButton } from "@/components/ui/split-button";
import { Eyebrow, PageShell } from "@/components/site-chrome";
import { FadeUp } from "@/components/scroll-fx";
import {
  FormPanel,
  FormField,
  fieldClassName,
  textareaClassName,
} from "@/components/ui/form-field";
import { submitContact } from "@/lib/backend/functions";
import { SITE } from "@/lib/site";
import archCanopy from "@/assets/decor/arch-canopy.webp";
import archTowerTall from "@/assets/decor/arch-tower-tall.webp";
import formBgBuildingSketch from "@/assets/decor/form-bg-building-sketch.webp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Lahlou Workers | Gros œuvre & construction à Agadir" },
      {
        name: "description",
        content:
          "Parlons de votre chantier à Agadir ou partout au Maroc : gros œuvre, aménagement, VRD, rénovation. Réponse sous 24 h - lahlou.workers@gmail.com.",
      },
      { property: "og:title", content: "Contact | Lahlou Workers" },
      {
        property: "og:description",
        content: "Décrivez votre chantier, on s’occupe des équipes. Réponse sous 24 h.",
      },
      { name: "geo.region", content: "MA-AGD" },
      { name: "geo.placename", content: "Agadir" },
    ],
  }),
  component: Contact,
});

const rows: [string, string, string | undefined][] = [
  ["Email", SITE.email, `mailto:${SITE.email}`],
  ["Adresse", `${SITE.address.street}, ${SITE.address.city}`, undefined],
  ["Horaires", SITE.hours, undefined],
  ["LinkedIn", "lahlou-workersconstruction", SITE.socials.linkedin],
  ["Instagram", "lahlou.workers", SITE.socials.instagram],
];

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSending(true);
    setError(null);
    try {
      await submitContact({
        data: {
          name: String(fd.get("name") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          email: String(fd.get("email") ?? ""),
          message: String(fd.get("message") ?? ""),
          company_website: String(fd.get("company_website") ?? ""),
        },
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Envoi impossible. Réessayez ou écrivez à " + SITE.email,
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell header="dark">
      <section className="relative mx-auto grid max-w-[1440px] gap-16 overflow-hidden bg-foreground px-5 pb-24 pt-40 text-background lg:grid-cols-12 lg:px-8 lg:pb-36 lg:pt-48">
        <img
          src={formBgBuildingSketch}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <img
          src={archTowerTall}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="pointer-events-none absolute -right-32 -top-16 hidden w-[640px] opacity-[0.14] lg:block"
        />
        <FadeUp className="relative lg:col-span-7">
          <Eyebrow label="Contact" />
          <h1 className="mt-6 font-display text-[30px] font-bold leading-[0.95] lg:text-[58px]">
            Parlons de votre chantier.
          </h1>
          {submitted ? (
            <FormPanel className="mt-10 flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary bg-primary/15">
                <Check className="h-5 w-5 text-primary" />
              </span>
              <div>
                <p className="font-display text-xl font-bold">Merci.</p>
                <p className="mt-1 text-sm text-background/70">
                  Nous revenons vers vous sous 24 h ouvrées.
                </p>
              </div>
            </FormPanel>
          ) : (
            <FormPanel className="mt-10">
              <form onSubmit={handleSubmit} className="grid gap-6" noValidate={false}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label="Nom" icon={User}>
                    <input
                      required
                      name="name"
                      type="text"
                      autoComplete="name"
                      minLength={2}
                      maxLength={120}
                      placeholder="Votre nom"
                      className={fieldClassName}
                    />
                  </FormField>
                  <FormField label="Téléphone" icon={Phone}>
                    <input
                      required
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+212 6 XX XX XX XX"
                      className={fieldClassName}
                    />
                  </FormField>
                </div>
                <FormField label="Email" icon={Mail}>
                  <input
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    className={fieldClassName}
                  />
                </FormField>
                <FormField label="Message" icon={MessageSquare}>
                  <textarea
                    required
                    name="message"
                    rows={5}
                    minLength={10}
                    maxLength={5000}
                    placeholder="Décrivez votre besoin : lieu, métier, effectif, date…"
                    className={textareaClassName}
                  />
                </FormField>
                {/* Honeypot anti-spam */}
                <input
                  type="text"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />
                {error && (
                  <p role="alert" className="text-sm text-primary">
                    {error}
                  </p>
                )}
                <SplitButton type="submit" disabled={sending} className="mt-2">
                  {sending ? "Envoi…" : "Envoyer"}
                </SplitButton>
              </form>
            </FormPanel>
          )}
        </FadeUp>

        <FadeUp delay={0.15} className="relative lg:col-span-4 lg:col-start-9">
          <address className="border-t border-background/40 pt-6 not-italic">
            {rows.map(([label, value, href]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 border-b border-background/15 py-4 text-sm"
              >
                <span className="text-background/70">{label}</span>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="break-all text-right font-semibold hover:text-primary"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-right font-semibold">{value}</span>
                )}
              </div>
            ))}
          </address>
          <div
            className="relative mt-6 aspect-[4/3] w-full overflow-hidden bg-background/10"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--background) 1px, transparent 1px), linear-gradient(45deg, var(--background) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          >
            <img
              src={archCanopy}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-6 opacity-60"
              style={{ filter: "invert(1)" }}
            />
          </div>
        </FadeUp>
      </section>
    </PageShell>
  );
}

