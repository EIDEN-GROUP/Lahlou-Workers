import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { User, Briefcase, Calendar, MapPin, Phone, Check } from "lucide-react";
import { SplitButton } from "@/components/ui/split-button";
import { Eyebrow, PageShell } from "@/components/site-chrome";
import { FadeUp, HeroParallax, Stagger, StaggerItem } from "@/components/scroll-fx";
import { FormPanel, FormField, fieldClassName } from "@/components/ui/form-field";
import heroImage from "@/assets/lahlou-hero.jpg";
import archPencils from "@/assets/decor/arch-pencils.png";
import archTerrace from "@/assets/decor/arch-terrace.png";
import formBgBuildingSketch from "@/assets/decor/form-bg-building-sketch.png";

export const Route = createFileRoute("/recrutement")({
  head: () => ({ meta: [
    { title: "Recrutement — Lahlou Workers" },
    { name: "description", content: "Vous savez travailler. On a le chantier. Rejoignez les équipes Lahlou." },
  ] }),
  component: Recrutement,
});

const offers = [
  ["Travail régulier", "Des chantiers qui s’enchaînent, pas des missions ponctuelles."],
  ["Paie à temps", "Un versement à date fixe, chaque fois."],
  ["Équipement fourni", "Casque, gants, chaussures : tout est fourni avant le premier jour."],
  ["Encadrement", "Un chef d’équipe présent sur chaque chantier, jamais livré à soi-même."],
];

const trades = ["Maçon", "Coffreur", "Ferrailleur", "Peintre", "Carreleur", "Plombier", "Électricien", "Chef d’équipe", "Soudeur", "Manœuvre"];

function Recrutement() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return <PageShell header="hero">
    <section className="relative min-h-[70svh] overflow-hidden bg-foreground text-background">
      <HeroParallax src={heroImage} alt="Ouvriers Lahlou Workers sur chantier" />
      <div className="absolute inset-0 bg-foreground/55" />
      <div className="relative mx-auto flex min-h-[70svh] max-w-[1440px] flex-col justify-end px-5 pb-16 pt-32 lg:px-8">
        <FadeUp><Eyebrow label="Recrutement" /><h1 className="mt-6 font-display text-[28px] font-bold leading-[0.95] lg:text-[52px]">Vous savez travailler.<br/>On a le <span className="text-primary">chantier</span>.</h1></FadeUp>
      </div>
    </section>

    <section className="relative mx-auto max-w-[1440px] overflow-hidden px-5 py-20 lg:px-8">
      <img src={archPencils} alt="" aria-hidden className="pointer-events-none absolute -right-32 -top-16 hidden w-[720px] opacity-[0.22] mix-blend-multiply lg:block" />
      <Stagger className="grid gap-x-8 gap-y-8 border-y border-border py-2 sm:grid-cols-2 lg:grid-cols-4">{offers.map((o, i) => <StaggerItem key={o[0]} className={`py-8 ${i > 0 ? "sm:border-l sm:pl-8 lg:border-l" : ""}`}><h3 className="font-display text-xl font-bold">{o[0]}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{o[1]}</p></StaggerItem>)}</Stagger>
    </section>

    <section className="relative mx-auto max-w-[1440px] overflow-hidden px-5 pb-16 lg:px-8">
      <img src={archTerrace} alt="" aria-hidden className="pointer-events-none absolute -left-36 -bottom-24 hidden w-[760px] opacity-[0.22] mix-blend-multiply lg:block" />
      <FadeUp><Eyebrow label="Métiers recherchés" /></FadeUp>
      <FadeUp delay={0.1} className="mt-6 flex flex-wrap gap-2">{trades.map(t => <span key={t} className="border border-border px-4 py-2 text-xs font-semibold text-muted-foreground">{t}</span>)}</FadeUp>
    </section>

    <section className="relative overflow-hidden bg-foreground py-20 text-background lg:py-32">
      <img src={formBgBuildingSketch} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="relative mx-auto max-w-2xl px-5 lg:px-8">
        <FadeUp><Eyebrow label="Postuler" /><h2 className="mt-6 font-display text-3xl font-bold lg:text-5xl">Rejoindre l’équipe.</h2></FadeUp>
        {submitted ? (
          <FormPanel className="mt-10 flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary bg-primary/15"><Check className="h-5 w-5 text-primary" /></span>
            <div><p className="font-display text-xl font-bold">Merci.</p><p className="mt-1 text-sm text-background/70">On vous rappelle sous 48 h.</p></div>
          </FormPanel>
        ) : (
          <FadeUp delay={0.15}>
            <FormPanel className="mt-10">
              <form onSubmit={handleSubmit} className="grid gap-6">
                <FormField label="Nom complet" icon={User}><input required type="text" placeholder="Votre nom" className={fieldClassName} /></FormField>
                <FormField label="Métier" icon={Briefcase}>
                  <select required defaultValue="" className={fieldClassName}>
                    <option value="" disabled>Choisir un métier</option>
                    {trades.map(t => <option key={t} value={t} className="text-foreground">{t}</option>)}
                  </select>
                </FormField>
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label="Années d’expérience" icon={Calendar}><input required type="number" min={0} placeholder="0" className={fieldClassName} /></FormField>
                  <FormField label="Ville" icon={MapPin}><input required type="text" placeholder="Agadir" className={fieldClassName} /></FormField>
                </div>
                <FormField label="Téléphone ou WhatsApp" icon={Phone}><input required type="tel" placeholder="+212 6 00 00 00 00" className={fieldClassName} /></FormField>
                <SplitButton type="submit" dark className="mt-2">Postuler</SplitButton>
              </form>
            </FormPanel>
          </FadeUp>
        )}
      </div>
    </section>
  </PageShell>;
}
