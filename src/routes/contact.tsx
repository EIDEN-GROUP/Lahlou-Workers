import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SplitButton } from "@/components/ui/split-button";
import { Eyebrow, PageShell } from "@/components/site-chrome";
import { FadeUp } from "@/components/scroll-fx";
import archCanopy from "@/assets/decor/arch-canopy.png";
import archTowerTall from "@/assets/decor/arch-tower-tall.png";

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
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); setSubmitted(true); };

  return <PageShell>
    <section className="relative mx-auto grid max-w-[1440px] gap-16 overflow-hidden px-5 pb-24 pt-40 lg:grid-cols-12 lg:px-8 lg:pb-36 lg:pt-48">
      <img src={archTowerTall} alt="" aria-hidden className="pointer-events-none absolute -right-32 -top-16 hidden w-[640px] opacity-[0.22] mix-blend-multiply lg:block" />
      <FadeUp className="lg:col-span-7">
        <Eyebrow label="Contact" />
        <h1 className="mt-6 font-display text-[30px] font-bold leading-[0.95] lg:text-[58px]">Parlons de votre chantier.</h1>
        {submitted ? (
          <div className="mt-14 border-t border-border pt-10"><p className="font-display text-2xl font-bold">Merci.</p><p className="mt-3 text-muted-foreground">Nous revenons vers vous rapidement.</p></div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-14 grid gap-6 border-t border-border pt-10">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">Nom<input required type="text" className="h-14 border border-border bg-transparent px-4 text-base appearance-none rounded-none outline-none focus:border-primary" /></label>
              <label className="grid gap-2 text-sm font-semibold">Téléphone<input required type="tel" className="h-14 border border-border bg-transparent px-4 text-base appearance-none rounded-none outline-none focus:border-primary" /></label>
            </div>
            <label className="grid gap-2 text-sm font-semibold">Email<input required type="email" className="h-14 border border-border bg-transparent px-4 text-base appearance-none rounded-none outline-none focus:border-primary" /></label>
            <label className="grid gap-2 text-sm font-semibold">Message<textarea required rows={5} className="border border-border bg-transparent px-4 py-3 text-base appearance-none rounded-none outline-none focus:border-primary" /></label>
            <SplitButton type="submit" className="mt-2">Envoyer</SplitButton>
          </form>
        )}
      </FadeUp>

      <FadeUp delay={0.15} className="lg:col-span-4 lg:col-start-9">
        <div className="border-t border-foreground pt-6">{rows.map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-border py-4 text-sm"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{value}</span></div>)}</div>
        <div className="relative mt-6 aspect-[4/3] w-full overflow-hidden bg-secondary" style={{ backgroundImage: "linear-gradient(135deg, var(--border) 1px, transparent 1px), linear-gradient(45deg, var(--border) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
          <img src={archCanopy} alt="" aria-hidden className="absolute inset-0 h-full w-full object-contain p-6 opacity-35 mix-blend-multiply" />
        </div>
      </FadeUp>
    </section>
  </PageShell>;
}
