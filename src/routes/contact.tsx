import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { User, Phone, Mail, MessageSquare, Check } from "lucide-react";
import { SplitButton } from "@/components/ui/split-button";
import { Eyebrow, PageShell } from "@/components/site-chrome";
import { FadeUp } from "@/components/scroll-fx";
import { FormPanel, FormField, fieldClassName, textareaClassName } from "@/components/ui/form-field";
import { submitContact } from "@/lib/backend/functions";
import archCanopy from "@/assets/decor/arch-canopy.png";
import archTowerTall from "@/assets/decor/arch-tower-tall.png";
import formBgBuildingSketch from "@/assets/decor/form-bg-building-sketch.png";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — Lahlou Workers" },
    { name: "description", content: "Parlons de votre chantier." },
  ] }),
  component: Contact,
});

const rows = [
  ["Téléphone", "+212 6 00 00 00 00"],
  ["WhatsApp", "+212 6 00 00 00 00"],
  ["Email", "contact@lahlou-workers.com"],
  ["Adresse", "N°118 Avenue Tanger, Agadir"],
  ["Horaires", "Lun–Sam · 8h–18h"],
];

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSending(true);
    try {
      await submitContact({ data: {
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        email: String(fd.get("email") ?? ""),
        message: String(fd.get("message") ?? ""),
      } });
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  return <PageShell header="dark">
    <section className="relative mx-auto grid max-w-[1440px] gap-16 overflow-hidden bg-foreground px-5 pb-24 pt-40 text-background lg:grid-cols-12 lg:px-8 lg:pb-36 lg:pt-48">
      <img src={formBgBuildingSketch} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40" />
      <img src={archTowerTall} alt="" aria-hidden className="pointer-events-none absolute -right-32 -top-16 hidden w-[640px] opacity-[0.14] lg:block" />
      <FadeUp className="relative lg:col-span-7">
        <Eyebrow label="Contact" />
        <h1 className="mt-6 font-display text-[30px] font-bold leading-[0.95] lg:text-[58px]">Parlons de votre chantier.</h1>
        {submitted ? (
          <FormPanel className="mt-10 flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary bg-primary/15"><Check className="h-5 w-5 text-primary" /></span>
            <div><p className="font-display text-xl font-bold">Merci.</p><p className="mt-1 text-sm text-background/70">Nous revenons vers vous rapidement.</p></div>
          </FormPanel>
        ) : (
          <FormPanel className="mt-10">
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField label="Nom" icon={User}><input required name="name" type="text" placeholder="Votre nom" className={fieldClassName} /></FormField>
                <FormField label="Téléphone" icon={Phone}><input required name="phone" type="tel" placeholder="+212 6 00 00 00 00" className={fieldClassName} /></FormField>
              </div>
              <FormField label="Email" icon={Mail}><input required name="email" type="email" placeholder="vous@exemple.com" className={fieldClassName} /></FormField>
              <FormField label="Message" icon={MessageSquare}><textarea required name="message" rows={5} placeholder="Décrivez votre besoin…" className={textareaClassName} /></FormField>
              <SplitButton type="submit" disabled={sending} className="mt-2">{sending ? "Envoi…" : "Envoyer"}</SplitButton>
            </form>
          </FormPanel>
        )}
      </FadeUp>

      <FadeUp delay={0.15} className="relative lg:col-span-4 lg:col-start-9">
        <div className="border-t border-background/40 pt-6">{rows.map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-background/15 py-4 text-sm"><span className="text-background/70">{label}</span><span className="font-semibold">{value}</span></div>)}</div>
        <div className="relative mt-6 aspect-[4/3] w-full overflow-hidden bg-background/10" style={{ backgroundImage: "linear-gradient(135deg, var(--background) 1px, transparent 1px), linear-gradient(45deg, var(--background) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
          <img src={archCanopy} alt="" aria-hidden className="absolute inset-0 h-full w-full object-contain p-6 opacity-60" style={{ filter: "invert(1)" }} />
        </div>
      </FadeUp>
    </section>
  </PageShell>;
}
