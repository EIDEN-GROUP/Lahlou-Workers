import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { SplitButton } from "@/components/ui/split-button";
import { Eyebrow, PageShell } from "@/components/site-chrome";
import { FadeUp } from "@/components/scroll-fx";

export const Route = createFileRoute("/devis")({
  head: () => ({ meta: [
    { title: "Devis — Lahlou Workers" },
    { name: "description", content: "Demandez votre équipe en quatre étapes." },
  ] }),
  component: Devis,
});

const needs = ["Équipe seule", "Construction complète", "Finitions", "Rénovation"];
const trades = ["Maçons", "Coffreurs", "Ferrailleurs", "Peintres", "Carreleurs", "Plombiers", "Électriciens", "Chefs d’équipe"];
const channels = ["WhatsApp", "Appel", "Email"];

type FormState = {
  need: string;
  city: string;
  surface: string;
  startDate: string;
  duration: string;
  tradesSelected: string[];
  crewSize: number;
  name: string;
  company: string;
  phone: string;
  email: string;
  channel: string;
};

const initial: FormState = { need: "", city: "", surface: "", startDate: "", duration: "", tradesSelected: [], crewSize: 5, name: "", company: "", phone: "", email: "", channel: "" };

function Devis() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [done, setDone] = useState(false);
  const totalSteps = 4;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(f => ({ ...f, [key]: value }));
  const toggleTrade = (t: string) => setForm(f => ({ ...f, tradesSelected: f.tradesSelected.includes(t) ? f.tradesSelected.filter(x => x !== t) : [...f.tradesSelected, t] }));

  const canNext = [!!form.need, !!form.city && !!form.surface && !!form.startDate, form.tradesSelected.length > 0, !!form.name && !!form.phone][step];

  return <PageShell header="dark">
    <section className="min-h-svh bg-foreground pb-24 pt-32 text-background lg:pb-36 lg:pt-40">
      <div className="mx-auto max-w-2xl px-5 lg:px-8">
        {!done && <>
          <Eyebrow label="Devis" />
          <h1 className="mt-6 font-display text-3xl font-bold lg:text-5xl">Votre demande.</h1>

          <div className="mt-10 flex gap-2">{Array.from({ length: totalSteps }).map((_, i) => <div key={i} className={`h-[2px] flex-1 ${i < step ? "bg-background" : i === step ? "bg-primary" : "bg-background/20"}`} />)}</div>

          {step === 0 && <FadeUp className="mt-12">
            <h2 className="text-lg font-bold">Votre besoin</h2>
            <div className="mt-6 grid grid-cols-2 gap-3">{needs.map(n => <button key={n} onClick={() => set("need", n)} className={`aspect-square border p-5 text-left text-sm font-bold transition-colors ${form.need === n ? "border-primary" : "border-background/25"}`}>{n}</button>)}</div>
          </FadeUp>}

          {step === 1 && <FadeUp className="mt-12 grid gap-6">
            <h2 className="text-lg font-bold">Votre projet</h2>
            <label className="grid gap-2 text-sm font-semibold">Ville<input value={form.city} onChange={e => set("city", e.target.value)} type="text" className="h-14 border border-background/25 bg-transparent px-4 text-base appearance-none rounded-none outline-none focus:border-primary" /></label>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">Surface (m²)<input value={form.surface} onChange={e => set("surface", e.target.value)} type="number" className="h-14 border border-background/25 bg-transparent px-4 text-base appearance-none rounded-none outline-none focus:border-primary" /></label>
              <label className="grid gap-2 text-sm font-semibold">Date de début<input value={form.startDate} onChange={e => set("startDate", e.target.value)} type="date" className="h-14 border border-background/25 bg-transparent px-4 text-base appearance-none rounded-none outline-none focus:border-primary" /></label>
            </div>
            <label className="grid gap-2 text-sm font-semibold">Durée estimée<input value={form.duration} onChange={e => set("duration", e.target.value)} type="text" placeholder="ex. 3 mois" className="h-14 border border-background/25 bg-transparent px-4 text-base appearance-none rounded-none outline-none focus:border-primary" /></label>
          </FadeUp>}

          {step === 2 && <FadeUp className="mt-12">
            <h2 className="text-lg font-bold">Votre équipe</h2>
            <div className="mt-6 flex flex-wrap gap-2">{trades.map(t => <button key={t} onClick={() => toggleTrade(t)} className={`border px-4 py-2 text-xs font-semibold ${form.tradesSelected.includes(t) ? "border-primary text-primary" : "border-background/25 text-background/70"}`}>{t}</button>)}</div>
            <div className="mt-8 flex items-center gap-5">
              <span className="text-sm font-semibold">Taille d’équipe</span>
              <button onClick={() => set("crewSize", Math.max(1, form.crewSize - 1))} className="flex h-10 w-10 items-center justify-center border border-background/25">−</button>
              <span className="w-8 text-center font-display text-xl font-bold">{form.crewSize}</span>
              <button onClick={() => set("crewSize", form.crewSize + 1)} className="flex h-10 w-10 items-center justify-center border border-background/25">+</button>
            </div>
          </FadeUp>}

          {step === 3 && <FadeUp className="mt-12 grid gap-6">
            <h2 className="text-lg font-bold">Vos coordonnées</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">Nom<input value={form.name} onChange={e => set("name", e.target.value)} type="text" className="h-14 border border-background/25 bg-transparent px-4 text-base appearance-none rounded-none outline-none focus:border-primary" /></label>
              <label className="grid gap-2 text-sm font-semibold">Entreprise<input value={form.company} onChange={e => set("company", e.target.value)} type="text" className="h-14 border border-background/25 bg-transparent px-4 text-base appearance-none rounded-none outline-none focus:border-primary" /></label>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">Téléphone<input value={form.phone} onChange={e => set("phone", e.target.value)} type="tel" className="h-14 border border-background/25 bg-transparent px-4 text-base appearance-none rounded-none outline-none focus:border-primary" /></label>
              <label className="grid gap-2 text-sm font-semibold">Email<input value={form.email} onChange={e => set("email", e.target.value)} type="email" className="h-14 border border-background/25 bg-transparent px-4 text-base appearance-none rounded-none outline-none focus:border-primary" /></label>
            </div>
            <div className="grid gap-2 text-sm font-semibold">Canal préféré<div className="flex gap-2">{channels.map(c => <button key={c} onClick={() => set("channel", c)} className={`border px-4 py-2 text-xs font-semibold ${form.channel === c ? "border-primary text-primary" : "border-background/25 text-background/70"}`}>{c}</button>)}</div></div>
          </FadeUp>}

          <div className="mt-12 flex items-center justify-between border-t border-background/20 pt-6">
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="flex items-center gap-2 text-sm font-semibold disabled:opacity-30"><ArrowLeft className="h-4 w-4" /> Retour</button>
            {step < totalSteps - 1
              ? <SplitButton dark icon={ArrowRight} disabled={!canNext} onClick={() => setStep(s => s + 1)}>Suivant</SplitButton>
              : <SplitButton dark icon={Check} disabled={!canNext} onClick={() => setDone(true)}>Envoyer</SplitButton>}
          </div>
        </>}

        {done && <FadeUp>
          <Eyebrow label="Confirmation" />
          <h1 className="mt-6 font-display text-4xl font-bold lg:text-6xl">Demande reçue.</h1>
          <p className="mt-6 text-muted-foreground">Réponse sous 24 h.</p>
          <div className="mt-10 grid gap-3 border-t border-background/20 pt-8 text-sm">
            <div className="flex justify-between border-b border-background/10 pb-3"><span className="text-muted-foreground">Besoin</span><span>{form.need}</span></div>
            <div className="flex justify-between border-b border-background/10 pb-3"><span className="text-muted-foreground">Ville</span><span>{form.city}</span></div>
            <div className="flex justify-between border-b border-background/10 pb-3"><span className="text-muted-foreground">Métiers</span><span>{form.tradesSelected.join(", ") || "—"}</span></div>
            <div className="flex justify-between border-b border-background/10 pb-3"><span className="text-muted-foreground">Équipe</span><span>{form.crewSize} personnes</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Contact</span><span>{form.name}</span></div>
          </div>
        </FadeUp>}
      </div>
    </section>
  </PageShell>;
}
