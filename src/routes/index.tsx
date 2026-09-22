import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight, Menu, MessageCircle, Minus, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/lahlou-hero.jpg";
import craftImage from "@/assets/lahlou-craft.jpg";
import projectImage from "@/assets/lahlou-project.jpg";
import teamImage from "@/assets/lahlou-team.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Lahlou Workers — Construire avec les bonnes mains" },
    { name: "description", content: "Équipes qualifiées, mobilisées vite, pour vos chantiers partout au Maroc." },
    { property: "og:title", content: "Lahlou Workers — Construire avec les bonnes mains" },
    { property: "og:description", content: "Équipes qualifiées, mobilisées vite, pour vos chantiers partout au Maroc." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const services = [
  ["01", "Gros œuvre", "Maçonnerie", "Coffrage", "Ferraillage", "Béton"],
  ["02", "Finitions", "Plâtrerie", "Peinture", "Carrelage", "Menuiserie"],
  ["03", "Main-d’œuvre qualifiée", "Électriciens", "Plombiers", "Soudeurs", "Chefs d’équipe"],
  ["04", "Rénovation", "Diagnostic", "Dépose", "Reprise", "Remise en état"],
];

const steps = [
  { n: "01", name: "Besoin", title: "On cadre le chantier.", text: "Vous nous partagez le métier, le nombre de personnes, le lieu et la date de démarrage.", points: ["Un échange direct", "Un besoin clairement défini", "Un interlocuteur unique"] },
  { n: "02", name: "Devis", title: "On compose la bonne équipe.", text: "Nous sélectionnons les profils adaptés et vous transmettons une proposition claire.", points: ["Profils vérifiés", "Périmètre précis", "Délais annoncés"] },
  { n: "03", name: "Chantier", title: "L’équipe prend le relais.", text: "Nos ouvriers arrivent préparés, encadrés et prêts à avancer avec vos responsables.", points: ["Mobilisation coordonnée", "Suivi régulier", "Travail tenu jusqu’au bout"] },
];

function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return <a href="#top" className={`font-display text-[19px] font-black ${inverse ? "text-background" : "text-foreground"}`} aria-label="Lahlou Workers, accueil">lahl<span className="text-primary">o</span>u workers</a>;
}

function SectionHead({ label, title, red }: { label: string; title: string; red?: string }) {
  const parts = red ? title.split(red) : [title];
  return <div className="grid gap-7 border-t border-border pt-5 lg:grid-cols-12"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:col-span-3">{label}</p><h2 className="font-display text-[38px] font-black leading-[0.95] lg:col-span-8 lg:text-[68px]">{parts[0]}{red && <span className="text-primary">{red}</span>}{parts[1]}</h2></div>;
}

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const reviewsRef = useRef<HTMLDivElement>(null);

  return <main id="top">
    <header className="fixed inset-x-0 top-0 z-50 border-b border-foreground/15 bg-background/95">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 lg:px-8">
        <Wordmark />
        <nav className="hidden items-center gap-8 text-[13px] font-semibold lg:flex" aria-label="Navigation principale">
          <a href="#apropos">À propos</a><a href="#metiers">Métiers</a><a href="#realisations">Réalisations</a><a href="#methode">Méthode</a>
        </nav>
        <div className="flex items-center gap-4"><span className="hidden text-[11px] font-bold sm:block">FR <span className="text-muted-foreground">/ AR / EN</span></span><Button asChild className="hidden h-10 px-5 text-xs sm:inline-flex"><a href="#contact">Demander une équipe <ArrowRight /></a></Button><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Ouvrir le menu">{menuOpen ? <X /> : <Menu />}</Button></div>
      </div>
      {menuOpen && <nav className="border-t border-border bg-background px-5 py-8 text-3xl font-display font-black lg:hidden"><div className="grid gap-5">{[["À propos","apropos"],["Métiers","metiers"],["Réalisations","realisations"],["Méthode","methode"]].map(([a,b])=><a key={b} href={`#${b}`} onClick={()=>setMenuOpen(false)}>{a}</a>)}</div></nav>}
    </header>

    <section className="relative min-h-[760px] h-[94svh] overflow-hidden bg-foreground text-background">
      <img src={heroImage} alt="Équipe Lahlou au travail sur un chantier à Casablanca" width={1920} height={1200} className="absolute inset-0 h-full w-full object-cover opacity-70" fetchPriority="high" />
      <div className="absolute inset-0 bg-foreground/35" />
      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-5 pb-8 pt-28 lg:px-8 lg:pb-12">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className="overflow-hidden lg:col-span-8"><h1 className="reveal-line font-display text-[52px] font-black leading-[0.88] lg:text-[96px]">On construit avec<br/>les bonnes <span className="text-primary">mains.</span></h1></div>
          <div className="lg:col-span-4 lg:pb-2"><p className="max-w-sm text-base leading-relaxed lg:text-lg">Des équipes qualifiées, mobilisées vite, sur vos chantiers partout au Maroc.</p><Button asChild size="lg" className="mt-6"><a href="#contact">Demander une équipe <ArrowRight /></a></Button></div>
        </div>
        <div className="mt-12 flex items-center justify-between border-t border-background/40 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em]"><span>Casablanca · Maroc</span><a href="#apropos" className="flex items-center gap-2">Découvrir <ArrowDown className="h-4 w-4" /></a></div>
      </div>
    </section>

    <section id="apropos" className="mx-auto max-w-[1440px] px-5 py-24 lg:px-8 lg:py-40">
      <SectionHead label="À propos" title="Plus que des bras." red="bras" />
      <div className="mt-20 grid border-y border-border md:grid-cols-3">{[
        ["01","Fiabilité","Une équipe annoncée est une équipe présente."], ["02","Savoir-faire","Des ouvriers sélectionnés et encadrés."], ["03","Rapidité","Une mobilisation en quelques jours, pas en semaines."],
      ].map((item,i)=><div key={item[0]} className={`py-8 md:px-8 ${i>0 ? "border-t border-border md:border-l md:border-t-0" : ""}`}><span className="text-xs font-bold text-muted-foreground">{item[0]}</span><h3 className="mt-10 font-display text-2xl font-black">{item[1]}</h3><p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{item[2]}</p></div>)}</div>
      <div className="mt-8 grid h-[560px] grid-cols-12 gap-3 overflow-hidden lg:h-[680px]"><img src={craftImage} alt="Maçon Lahlou réalisant un mur" loading="lazy" width={1600} height={1200} className="col-span-8 h-[62%] w-full object-cover lg:col-span-7 lg:h-[78%]"/><img src={teamImage} alt="Équipe de finition Lahlou" loading="lazy" width={1600} height={1200} className="col-span-4 mt-16 h-[54%] w-full object-cover lg:col-span-3 lg:mt-28 lg:h-[64%]"/><img src={projectImage} alt="Chantier résidentiel au Maroc" loading="lazy" width={1600} height={1200} className="col-span-7 col-start-5 -mt-40 h-[54%] w-full object-cover lg:col-span-4 lg:col-start-9 lg:-mt-52 lg:h-[62%]"/></div>
    </section>

    <section className="border-y border-border"><div className="mx-auto grid max-w-[1440px] px-5 lg:grid-cols-3 lg:px-8">{[["Maroc","Couverture nationale"],["03","Engagements tenus"],["01","Interlocuteur dédié"]].map((s,i)=><div key={s[1]} className={`py-16 lg:px-10 lg:py-24 ${i>0?"border-t border-border lg:border-l lg:border-t-0":""}`}><div className={`font-display text-[72px] font-black leading-none lg:text-[112px] ${i===1?"text-primary":""}`}>{s[0]}</div><p className="mt-5 text-sm font-bold uppercase tracking-[0.14em]">{s[1]}</p></div>)}</div></section>

    <section id="metiers" className="mx-auto max-w-[1440px] px-5 py-24 lg:px-8 lg:py-40"><SectionHead label="Services" title="Nos métiers." red="métiers"/><p className="ml-auto mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">Du gros œuvre à la dernière finition, des équipes ajustées à votre chantier.</p><div className="mt-20 border-t border-foreground">{services.map((s,i)=><div key={s[0]} className="group grid items-center gap-5 border-b border-border py-7 transition-[padding] duration-500 hover:py-10 lg:grid-cols-12"><span className={`text-xs font-bold ${i===0?"text-primary":"text-muted-foreground"}`}>{s[0]}</span><h3 className="font-display text-3xl font-black lg:col-span-5 lg:text-5xl">{s[1]}</h3><div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground lg:col-span-4">{s.slice(2).map(t=><span key={t}>{t}</span>)}</div><ArrowRight className="ml-auto transition-transform duration-500 group-hover:translate-x-2"/></div>)}</div></section>

    <section id="methode" className="bg-foreground py-24 text-background lg:py-40"><div className="mx-auto max-w-[1440px] px-5 lg:px-8"><SectionHead label="Méthode" title="Trois étapes. Pas de détour." red="Trois"/><div className="mt-20 grid gap-12 lg:grid-cols-12"><div className="lg:col-span-7"><div className="grid grid-cols-3 border-b border-background/25">{steps.map((s,i)=><button key={s.n} className={`border-b-2 py-5 text-left text-sm font-bold transition-colors ${activeStep===i?"border-primary text-background":"border-transparent text-muted-foreground"}`} onClick={()=>setActiveStep(i)}><span className="mr-3 text-[10px]">{s.n}</span>{s.name}</button>)}</div><div className="py-14"><h3 className="font-display text-4xl font-black lg:text-6xl">{steps[activeStep].title}</h3><p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{steps[activeStep].text}</p><ul className="mt-10 max-w-xl border-t border-background/20">{steps[activeStep].points.map(p=><li key={p} className="flex items-center gap-4 border-b border-background/20 py-4 text-sm"><span className="h-1.5 w-1.5 bg-primary"/>{p}</li>)}</ul></div></div><img src={teamImage} alt="Ouvriers Lahlou coordonnant les finitions" loading="lazy" width={1600} height={1200} className="h-[560px] w-full object-cover lg:col-span-5"/></div></div></section>

    <section id="realisations" className="mx-auto max-w-[1440px] px-5 py-24 lg:px-8 lg:py-40"><SectionHead label="Réalisations" title="Chantiers livrés." red="livrés"/><div className="mt-20 grid gap-12 lg:grid-cols-12"><article className="lg:col-span-7"><img src={projectImage} alt="Projet résidentiel au Maroc" loading="lazy" width={1600} height={1200} className="aspect-[4/3] w-full object-cover"/><div className="mt-5 flex justify-between border-t border-border pt-4"><div><h3 className="font-display text-2xl font-black">Projet résidentiel</h3><p className="mt-1 text-sm text-muted-foreground">Rabat · Gros œuvre</p></div><span className="text-xs font-bold">01</span></div></article><article className="lg:col-span-5 lg:pt-36"><img src={teamImage} alt="Travaux de finition intérieure" loading="lazy" width={1600} height={1200} className="aspect-[4/3] w-full object-cover"/><div className="mt-5 flex justify-between border-t border-border pt-4"><div><h3 className="font-display text-2xl font-black">Finitions intérieures</h3><p className="mt-1 text-sm text-muted-foreground">Casablanca · Second œuvre</p></div><span className="text-xs font-bold">02</span></div></article></div></section>

    <section className="border-y border-border py-24 lg:py-32"><div className="mx-auto max-w-[1440px] px-5 lg:px-8"><div className="flex items-end justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Témoignages</p><h2 className="mt-7 font-display text-4xl font-black lg:text-6xl">Ils nous font confiance.</h2></div><div className="hidden gap-2 sm:flex"><Button variant="outline" size="icon" aria-label="Témoignage précédent" onClick={()=>reviewsRef.current?.scrollBy({left:-420,behavior:"smooth"})}><ChevronLeft/></Button><Button variant="outline" size="icon" aria-label="Témoignage suivant" onClick={()=>reviewsRef.current?.scrollBy({left:420,behavior:"smooth"})}><ChevronRight/></Button></div></div><div ref={reviewsRef} className="mt-16 flex snap-x gap-5 overflow-x-auto pb-5 [scrollbar-width:none]">{[
        ["Une équipe ponctuelle, autonome et claire dans ses échanges. Le chantier a avancé sans perte de temps.","Maîtrise d’ouvrage","Casablanca"],
        ["Les profils correspondaient vraiment au besoin. L’encadrement a fait la différence dès le premier jour.","Entreprise générale","Rabat"],
        ["Un interlocuteur disponible et des ouvriers qui connaissent leur métier. C’est simple et efficace.","Client privé","Marrakech"],
      ].map((r,i)=><blockquote key={r[2]} className="min-w-[86vw] snap-start border-t border-foreground pt-7 sm:min-w-[420px]"><span className={i===0?"font-display text-5xl text-primary":"font-display text-5xl"}>“</span><p className="mt-10 text-xl font-medium leading-relaxed">{r[0]}</p><footer className="mt-14 border-t border-border pt-4 text-sm"><strong>{r[1]}</strong><span className="ml-3 text-muted-foreground">{r[2]}</span></footer></blockquote>)}</div></div></section>

    <section className="mx-auto grid max-w-[1440px] gap-16 px-5 py-24 lg:grid-cols-12 lg:px-8 lg:py-40"><div className="lg:col-span-5"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Questions</p><h2 className="mt-7 font-display text-4xl font-black lg:text-6xl">Avant de commencer.</h2><p className="mt-6 max-w-sm text-muted-foreground">Les réponses utiles pour cadrer votre demande.</p></div><div className="border-t border-foreground lg:col-span-7">{[
      ["Intervenez-vous partout au Maroc ?","Oui. Nous organisons les équipes selon la ville, la durée et les besoins du chantier."],
      ["Quels profils pouvez-vous mobiliser ?","Maçons, coffreurs, ferrailleurs, peintres, carreleurs, plombiers, électriciens et chefs d’équipe."],
      ["Pouvez-vous prendre en charge un chantier complet ?","Oui. Nous intervenons en équipe seule ou sur un périmètre complet, du gros œuvre aux finitions."],
      ["Comment demander un devis ?","Décrivez le lieu, le métier, l’effectif et la date souhaitée. Nous revenons vers vous pour préciser le besoin."],
    ].map((f,i)=><div key={f[0]} className="border-b border-border"><button className="flex w-full items-center justify-between py-6 text-left font-bold" onClick={()=>setOpenFaq(openFaq===i?-1:i)} aria-expanded={openFaq===i}>{f[0]}{openFaq===i?<Minus/>:<Plus/>}</button>{openFaq===i&&<p className="max-w-xl pb-7 text-sm leading-relaxed text-muted-foreground">{f[1]}</p>}</div>)}</div></section>

    <section id="contact" className="bg-primary text-primary-foreground"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 lg:grid-cols-12 lg:px-8 lg:py-28"><div className="lg:col-span-8"><p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Contact</p><h2 className="mt-8 font-display text-[46px] font-black leading-[0.92] lg:text-[82px]">Votre prochain chantier commence ici.</h2></div><div className="flex flex-col justify-end lg:col-span-4"><p className="max-w-sm text-lg">Dites-nous ce dont vous avez besoin. On s’occupe des équipes.</p><Button asChild size="lg" className="mt-8 w-fit bg-foreground text-background hover:bg-dark-surface"><a href="mailto:contact@lahlouworkers.ma">Obtenir un devis <ArrowRight/></a></Button></div></div></section>

    <footer className="bg-foreground text-background"><div className="mx-auto max-w-[1440px] px-5 py-12 lg:px-8 lg:py-16"><div className="grid gap-12 border-b border-background/20 pb-16 lg:grid-cols-12"><div className="lg:col-span-5"><Wordmark inverse/><p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">Des équipes qualifiées pour construire partout au Maroc.</p></div><div className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3"><div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Navigation</p><div className="mt-5 grid gap-3 text-sm"><a href="#apropos">À propos</a><a href="#metiers">Métiers</a><a href="#realisations">Réalisations</a></div></div><div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Écrire</p><div className="mt-5 grid gap-3 text-sm"><a href="mailto:contact@lahlouworkers.ma">contact@lahlouworkers.ma</a><a href="#contact">Demander une équipe</a></div></div><div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Zone</p><p className="mt-5 text-sm">Maroc</p></div></div></div><div className="flex flex-col gap-3 pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between"><span>© 2026 Lahlou Workers</span><span>Construction · Main-d’œuvre qualifiée</span></div></div></footer>
    <a href="#contact" aria-label="Contacter Lahlou Workers sur WhatsApp" className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center border border-background/20 bg-dark-surface text-background transition-transform hover:-translate-y-1"><MessageCircle/></a>
  </main>;
}
