import { createFileRoute } from "@tanstack/react-router";
import { Plus, Star } from "lucide-react";
import { useState } from "react";
import { SplitButton } from "@/components/ui/split-button";
import { Eyebrow, PageShell, SectionHead } from "@/components/site-chrome";
import { FadeUp, HeroParallax, ParallaxImage, PinnedCircleReveal, RevealImage, ScrollProgressBar, Stagger, StaggerItem, StickySteps } from "@/components/scroll-fx";
import { StackedProjects } from "@/components/ui/stacked-projects";
import heroImage from "@/assets/lahlou-hero.jpg";
import craftImage from "@/assets/lahlou-craft.jpg";
import projectImage from "@/assets/lahlou-project.jpg";
import teamImage from "@/assets/lahlou-team.jpg";
import serviceGrosOeuvre from "@/assets/service-gros-oeuvre.jpg";
import methodeImage from "@/assets/methode-coordination-equipe.jpg";
import galerieAerien from "@/assets/galerie-chantier-aerien.jpg";
import stampChantierLivre from "@/assets/decor/stamp-chantier-livre.png";
import archCanopy from "@/assets/decor/arch-canopy.png";
import archTower from "@/assets/decor/arch-tower.png";
import archBridge from "@/assets/decor/arch-bridge.png";
import archCluster from "@/assets/decor/arch-cluster.png";
import archCraneBridge from "@/assets/decor/arch-crane-bridge.png";
import archStack from "@/assets/decor/arch-stack.png";
import partnerLogo01 from "@/assets/partners/partner-01.png";
import partnerLogo02 from "@/assets/partners/partner-02.png";
import partnerLogo03 from "@/assets/partners/partner-03.png";
import partnerLogo04 from "@/assets/partners/partner-04.png";
import partnerLogo05 from "@/assets/partners/partner-05.png";
import partnerLogo06 from "@/assets/partners/partner-06.png";
import partnerLogo07 from "@/assets/partners/partner-07.png";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Lahlou Workers — Construction haut de gamme à Agadir" },
    { name: "description", content: "Résidences de standing et immeubles de bureaux, du gros œuvre à la livraison. Basés à Agadir, nous intervenons partout au Maroc." },
    { property: "og:title", content: "Lahlou Workers — Construction haut de gamme à Agadir" },
    { property: "og:description", content: "Résidences de standing et immeubles de bureaux, du gros œuvre à la livraison. Basés à Agadir, nous intervenons partout au Maroc." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const steps = [
  { n: "01", name: "Besoin", title: "On cadre le chantier.", text: "Vous nous partagez le métier, le nombre de personnes, le lieu et la date de démarrage.", points: ["Un échange direct", "Un besoin clairement défini", "Un interlocuteur unique"], image: methodeImage },
  { n: "02", name: "Devis", title: "On compose la bonne équipe.", text: "Nous sélectionnons les profils adaptés et vous transmettons une proposition claire.", points: ["Profils vérifiés", "Périmètre précis", "Délais annoncés"], image: craftImage },
  { n: "03", name: "Chantier", title: "L’équipe prend le relais.", text: "Nos ouvriers arrivent préparés, encadrés et prêts à avancer avec vos responsables.", points: ["Mobilisation coordonnée", "Suivi régulier", "Travail tenu jusqu’au bout"], image: teamImage },
];

const projectCardsData: { category: string; title: string; src: string; detail: string }[] = [
  { category: "Résidentiel · Agadir", title: "Résidences MISSIMI", src: projectImage, detail: "Ensemble résidentiel de standing livré clé en main, du gros œuvre aux finitions." },
  { category: "Résidentiel · Agadir", title: "Immeuble R+5 post-tension", src: galerieAerien, detail: "Structure post-tension pilotée avec un suivi technique constant jusqu’à la livraison." },
  { category: "Résidentiel · Agadir", title: "Villa avec piscine", src: teamImage, detail: "Villa individuelle avec piscine, finitions haut de gamme et équipe dédiée sur site." },
  { category: "Industriel · Tan-Tan", title: "Infrastructure cimenterie", src: craftImage, detail: "Chantier industriel d’envergure mené en coordination avec les équipes techniques du client." },
  { category: "Rénovation · Agadir", title: "Rénovation siège administratif", src: heroImage, detail: "Réhabilitation complète d’un siège administratif en activité, sans interruption d’exploitation." },
  { category: "Commercial · Agadir", title: "Aménagement de bureaux", src: serviceGrosOeuvre, detail: "Aménagement d’espaces de bureaux, du second œuvre à la livraison des lots." },
];


const partnerLogos = [partnerLogo01, partnerLogo02, partnerLogo03, partnerLogo04, partnerLogo05, partnerLogo06, partnerLogo07];

const faqs = [
  { q: "Intervenez-vous partout au Maroc ?", a: "Oui. Nous organisons les équipes selon la ville, la durée et les besoins du chantier." },
  { q: "Quels profils pouvez-vous mobiliser ?", a: "Maçons, coffreurs, ferrailleurs, peintres, carreleurs, plombiers, électriciens et chefs d’équipe." },
  { q: "Pouvez-vous prendre en charge un chantier complet ?", a: "Oui. Nous intervenons en équipe seule ou sur un périmètre complet, du gros œuvre aux finitions." },
  { q: "Comment demander un devis ?", a: "Décrivez le lieu, le métier, l’effectif et la date souhaitée. Nous revenons vers vous pour préciser le besoin." },
];

const testimonials = [
  { quote: "Une équipe ponctuelle, autonome et claire dans ses échanges. Le chantier a avancé sans perte de temps.", name: "Maîtrise d’ouvrage", city: "Agadir", image: projectImage },
  { quote: "Les profils correspondaient vraiment au besoin. L’encadrement a fait la différence dès le premier jour.", name: "Entreprise générale", city: "Taroudant", image: craftImage },
  { quote: "Un interlocuteur disponible et des ouvriers qui connaissent leur métier. C’est simple et efficace.", name: "Client privé", city: "Inezgane", image: teamImage },
  { quote: "Chantier livré dans les temps, avec un suivi rigoureux du début à la fin.", name: "Promoteur immobilier", city: "Tan-Tan", image: serviceGrosOeuvre },
];

function Index() {
  const [openFaq, setOpenFaq] = useState(0);

  return <PageShell header="hero">
    <ScrollProgressBar />
    <section className="relative h-svh overflow-hidden bg-foreground text-background">
      <HeroParallax src={heroImage} alt="Équipe Lahlou au travail sur un chantier à Agadir" />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/15 to-foreground/85" />
      <div className="relative mx-auto flex h-svh max-w-[1440px] flex-col justify-end px-5 pb-12 pt-32 lg:px-8 lg:pb-16">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <div className="overflow-hidden"><h1 className="reveal-line font-display text-[40px] font-bold uppercase leading-[0.95] sm:text-[52px] lg:text-[80px]">On construit avec</h1></div>
            <div className="overflow-hidden"><h1 className="reveal-line font-display text-[40px] font-bold uppercase leading-[0.95] sm:text-[52px] lg:text-[80px]" style={{ animationDelay: "120ms" }}>les bonnes <span className="text-primary">mains</span>.</h1></div>
          </div>
          <FadeUp delay={0.5} className="lg:col-span-4 lg:pb-2"><p className="max-w-sm text-sm leading-relaxed text-background/85 lg:text-base">Construction haut de gamme depuis Agadir, pour vos résidences et immeubles de bureaux partout au Maroc.</p><SplitButton href="/devis" className="mt-7">Demander une équipe</SplitButton></FadeUp>
        </div>
        <FadeUp delay={0.7} className="mt-14 flex items-center justify-between border-t border-background/25 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-background/70"><span>Agadir · Maroc</span><a href="#apropos" className="flex items-center gap-2 text-background">Défiler</a></FadeUp>
        <FadeUp delay={0.85} className="mt-10 flex items-center gap-8">
          <p className="hidden shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-background/70 lg:flex"><span className="h-2 w-2 rounded-full bg-primary" />Partenaires</p>
          <div className="group flex-1 overflow-hidden">
            <div className="photo-drift flex w-max items-center gap-14 group-hover:[animation-play-state:paused]">
              {[...partnerLogos, ...partnerLogos].map((src, i) => <div key={i} className="flex h-24 shrink-0 items-center justify-center"><img src={src} alt="" loading="lazy" width={320} height={160} className="max-h-20 w-auto object-contain invert" /></div>)}
            </div>
          </div>
        </FadeUp>
      </div>
    </section>

    <section id="apropos" className="relative mx-auto max-w-[1440px] px-5 py-20 lg:px-8 lg:py-28">
      <img src={archCanopy} alt="" aria-hidden className="pointer-events-none absolute -right-24 -top-10 hidden w-[800px] opacity-[0.22] mix-blend-multiply lg:block" />
      <div className="relative grid items-start gap-10 lg:grid-cols-12">
        <FadeUp className="lg:col-span-7"><SectionHead label="À propos" title="Plus que des bras." red="bras" /></FadeUp>
        <FadeUp delay={0.15} className="max-w-md text-lg leading-relaxed text-muted-foreground lg:col-span-4 lg:col-start-9 lg:pt-16"><p>Depuis Agadir, nous construisons des résidences de standing et des immeubles de bureaux avec des standards internationaux, de la conception à la livraison.</p><div className="mt-6"><SplitButton href="/realisations">Nos réalisations</SplitButton></div></FadeUp>
      </div>
      <div className="relative mt-16 h-[440px] sm:h-[540px] lg:h-[620px]">
        <RevealImage src={craftImage} alt="Maçon Lahlou réalisant un mur" className="absolute inset-y-0 left-0 w-[62%] border border-border" />
        <RevealImage src={teamImage} alt="Équipe de finition Lahlou" className="absolute right-0 top-0 h-[46%] w-[34%] border border-border" />
        <ParallaxImage src={projectImage} alt="Chantier résidentiel au Maroc" className="absolute bottom-0 right-0 h-[42%] w-[30%] border border-border" strength={40} />
      </div>
    </section>

    <section id="realisations" className="relative bg-foreground py-24 text-background lg:py-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img src={archBridge} alt="" aria-hidden className="absolute -right-32 -top-24 w-[720px] max-w-none opacity-[0.14] lg:-right-40 lg:-top-32 lg:w-[1000px]" />
        <img src={stampChantierLivre} alt="" aria-hidden className="absolute right-8 top-8 w-20 -rotate-6 opacity-90 sm:w-28 lg:right-16 lg:top-12 lg:w-32" />
      </div>
      <div className="relative mx-auto max-w-[1440px] px-5 text-center lg:px-8">
        <FadeUp className="flex justify-center"><Eyebrow label="Projets" /></FadeUp>
        <FadeUp delay={0.1}><h2 className="mx-auto mt-8 max-w-2xl font-display text-[26px] font-bold uppercase leading-[0.95] lg:text-[44px]">Vos prochains chantiers<span className="ml-3 inline-block h-3 w-3 rounded-full bg-primary align-middle" /><br/>commencent ici.</h2></FadeUp>
        <FadeUp delay={0.2}><p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-background/70">Chantiers livrés partout au Maroc, avec la même exigence à chaque étape.</p></FadeUp>
        <FadeUp delay={0.3} className="mt-9 flex justify-center"><SplitButton href="/devis" dark>Demander une équipe</SplitButton></FadeUp>
      </div>
      <div className="relative mt-16">
        <StackedProjects items={projectCardsData.slice(0, 3).map(p => ({ category: p.category.split(" · ")[0] ?? p.category, title: p.title, description: p.detail, image: p.src }))} />
      </div>
    </section>

    <section id="methode" className="relative mx-auto max-w-[1440px] px-5 pb-0 pt-16 lg:px-8 lg:pt-24">
      <div className="relative overflow-hidden text-center">
        <img src={archCraneBridge} alt="" aria-hidden className="pointer-events-none absolute -left-40 -top-10 hidden w-[760px] opacity-[0.22] mix-blend-multiply lg:block" />
        <FadeUp>
          <div className="flex justify-center"><Eyebrow label="Fonctionnalités clés" /></div>
          <h2 className="mt-6 font-display text-[32px] font-bold lg:text-[56px]">Trois étapes. Pas de détour.</h2>
          <div className="mt-6 flex justify-center"><SplitButton href="/devis">Demander un devis</SplitButton></div>
        </FadeUp>
      </div>
      <div className="relative mt-16 lg:mt-20">
        <StickySteps
          steps={steps}
          renderImage={s => <img src={s.image} alt={s.title} loading="lazy" width={1200} height={900} className="h-full w-full border border-border object-cover" />}
          renderContent={s => (
            <div>
              <span className="font-display text-3xl font-bold text-muted-foreground/40">{s.n}</span>
              <h3 className="mt-4 font-display text-2xl font-bold lg:text-4xl">{s.title}</h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">{s.text}</p>
              <div className="mt-6 flex flex-wrap gap-2">{s.points.map(p => <span key={p} className="block border border-border bg-secondary px-4 py-2 text-xs font-semibold text-muted-foreground">{p}</span>)}</div>
            </div>
          )}
        />
      </div>
    </section>

    <section className="relative overflow-hidden bg-secondary py-24 lg:py-32">
      <img src={archStack} alt="" aria-hidden className="pointer-events-none absolute -right-32 -top-24 hidden w-[820px] opacity-[0.22] mix-blend-multiply lg:block" />
      <div className="relative mx-auto max-w-[1440px] px-5 lg:px-8">
        <FadeUp>
          <Eyebrow label="Avis" />
          <h2 className="mt-7 font-display text-4xl font-bold lg:text-6xl">Ils nous font confiance.</h2>
          <div className="mt-5"><SplitButton href="/realisations">Voir nos réalisations</SplitButton></div>
        </FadeUp>
      </div>
      <div className="group mt-16 overflow-hidden">
        <div className="photo-drift flex w-max gap-5 group-hover:[animation-play-state:paused]">
          {[...testimonials, ...testimonials].map((t, i) => <article key={i} className="w-[300px] shrink-0 bg-background sm:w-[360px]">
            <img src={t.image} alt="" loading="lazy" width={720} height={480} className="aspect-[4/3] w-full object-cover" />
            <div className="p-6">
              <div className="flex gap-1 text-primary">{Array.from({ length: 5 }).map((_, s) => <Star key={s} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-4 text-sm leading-relaxed">{t.quote}</p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-secondary font-display text-sm font-bold">{t.name[0]}</div>
                <div><p className="text-sm font-bold">{t.name}</p><p className="text-xs text-muted-foreground">{t.city}</p></div>
              </div>
            </div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="relative mx-auto max-w-[1440px] px-5 py-20 lg:px-8 lg:py-28">
      <img src={archTower} alt="" aria-hidden className="pointer-events-none absolute -left-32 bottom-0 hidden w-[700px] opacity-[0.22] mix-blend-multiply lg:block" />
      <div className="relative grid gap-10 lg:grid-cols-12">
        <FadeUp className="lg:col-span-4">
          <SectionHead label="Questions" title="Avant de commencer." red="commencer" />
          <p className="mt-6 max-w-sm text-muted-foreground">Les réponses aux questions les plus courantes. Une autre question ?</p>
          <div className="mt-6"><SplitButton href="/contact">Nous contacter</SplitButton></div>
        </FadeUp>
        <Stagger className="lg:col-span-7 lg:col-start-6">{faqs.map((f, i) => {
          const isOpen = openFaq === i;
          return <StaggerItem key={f.q}>
            <div className="border-b border-border">
              <button className="group flex w-full items-center gap-6 py-6 text-left" onClick={() => setOpenFaq(isOpen ? -1 : i)} aria-expanded={isOpen}>
                <span className={`font-display text-xs font-bold transition-colors ${isOpen ? "text-primary" : "text-muted-foreground/50"}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className={`flex-1 font-bold transition-colors ${isOpen ? "text-primary" : "group-hover:text-primary"}`}>{f.q}</span>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-300 ${isOpen ? "rotate-45 border-primary text-primary" : "text-muted-foreground"}`}><Plus className="h-4 w-4" /></span>
              </button>
              <div className="grid transition-[grid-template-rows] duration-[400ms] ease-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                <div className="overflow-hidden"><p className="max-w-xl pb-6 pl-[calc(1.5rem+1.9rem)] text-sm leading-relaxed text-muted-foreground">{f.a}</p></div>
              </div>
            </div>
          </StaggerItem>;
        })}</Stagger>
      </div>
    </section>

    <section id="contact">
      <PinnedCircleReveal className="flex h-svh items-center justify-center overflow-hidden bg-foreground text-background">
        <img src={archCluster} alt="" aria-hidden className="pointer-events-none absolute -left-40 -bottom-32 w-[760px] max-w-none opacity-[0.13] lg:-left-52 lg:-bottom-40 lg:w-[1040px]" />
        <div className="relative mx-auto max-w-[1440px] px-5 text-center lg:px-8">
          <FadeUp className="flex justify-center"><Eyebrow label="Contact" /></FadeUp>
          <FadeUp delay={0.1}><h2 className="mx-auto mt-8 max-w-3xl font-display text-[30px] font-bold uppercase leading-[0.95] lg:text-[64px]">Votre prochain chantier commence ici.</h2></FadeUp>
          <FadeUp delay={0.2}><p className="mx-auto mt-6 max-w-md text-lg text-background/75">Dites-nous ce dont vous avez besoin. On s’occupe des équipes.</p></FadeUp>
          <FadeUp delay={0.3} className="mt-9 flex justify-center"><SplitButton href="/devis">Obtenir un devis</SplitButton></FadeUp>
        </div>
      </PinnedCircleReveal>
    </section>
  </PageShell>;
}
