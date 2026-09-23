import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eyebrow, PageShell } from "@/components/site-chrome";
import { FolderFloat } from "@/components/ui/folder-float";
import { SplitButton } from "@/components/ui/split-button";
import { FadeUp, PinnedCircleReveal } from "@/components/scroll-fx";
import { StackedProjects } from "@/components/ui/stacked-projects";
import { listProjects } from "@/lib/backend/functions";
import craftImage from "@/assets/lahlou-craft.jpg";
import teamImage from "@/assets/lahlou-team.jpg";
import projectImage from "@/assets/lahlou-project.jpg";
import heroImage from "@/assets/lahlou-hero.jpg";
import galerieAerien from "@/assets/galerie-chantier-aerien.jpg";
import stampChantierLivre from "@/assets/decor/stamp-chantier-livre.png";
import archHouseRoof from "@/assets/decor/arch-house-roof.png";
import archCluster from "@/assets/decor/arch-cluster.png";

export const Route = createFileRoute("/realisations")({
  head: () => ({ meta: [
    { title: "Chantiers livrés — Lahlou Workers" },
    { name: "description", content: "Ce que nos équipes ont construit, partout au Maroc." },
  ] }),
  component: Realisations,
});

const filters = ["Tous", "Résidentiel", "Commercial", "Industriel", "Rénovation"];

const projects = [
  { name: "Résidences MISSIMI", city: "Agadir", year: "2025", type: "Résidentiel", image: projectImage, ratio: "aspect-[4/5]" },
  { name: "Immeuble R+5 — post-tension", city: "Agadir", year: "2024", type: "Résidentiel", image: galerieAerien, ratio: "aspect-[16/10]" },
  { name: "Villa avec piscine", city: "Agadir", year: "2024", type: "Résidentiel", image: teamImage, ratio: "aspect-square" },
  { name: "Infrastructure cimenterie", city: "Tan-Tan", year: "2024", type: "Industriel", image: craftImage, ratio: "aspect-[4/5]" },
  { name: "Rénovation siège administratif", city: "Agadir", year: "2023", type: "Rénovation", image: heroImage, ratio: "aspect-[16/10]" },
  { name: "Aménagement de bureaux", city: "Agadir", year: "2023", type: "Commercial", image: craftImage, ratio: "aspect-square" },
];

function Realisations() {
  const [active, setActive] = useState("Tous");
  // Admin-added projects (from /admin/projects) are merged in here so they get
  // the exact same StackedProjects motion as the historical ones — not a
  // separate plain list.
  // GSAP's pin setup mutates the DOM directly (wraps pinned nodes, inserts
  // spacers) outside React's control. If `items` changes after that's already
  // happened, React's next reconciliation pass crashes trying to diff against
  // DOM it no longer recognizes. So StackedProjects only ever mounts once
  // admin + static projects are already combined — never with a list that
  // changes size after the fact.
  const [adminProjects, setAdminProjects] = useState<{ name: string; city: string; year: string; type: string; image: string }[] | null>(null);
  useEffect(() => {
    listProjects().then(items => setAdminProjects(items.map(p => ({ name: p.title, city: p.city, year: p.year, type: p.category, image: p.image }))));
  }, []);

  const allProjects = [...(adminProjects ?? []), ...projects];
  const visible = active === "Tous" ? allProjects : allProjects.filter(p => p.type === active);

  return <PageShell>
    <section className="relative mx-auto max-w-[1440px] overflow-hidden px-5 pb-10 pt-40 lg:px-8 lg:pt-48">
      <img src={stampChantierLivre} alt="" aria-hidden className="pointer-events-none absolute right-6 top-36 w-20 -rotate-6 opacity-90 sm:w-28 lg:right-10 lg:top-44 lg:w-32" />
      <FadeUp><Eyebrow label="Réalisations" /><h1 className="mt-6 font-display text-[32px] font-bold leading-[0.95] lg:text-[64px]">Chantiers livrés.</h1></FadeUp>
      <FadeUp delay={0.1} className="mt-20 lg:mt-28">
        <FolderFloat
          items={filters}
          label="Filtrer"
          sublabel={active === "Tous" ? "Tous les chantiers" : active}
          trigger="click"
          closeOnSelect
          onSelect={value => setActive(value)}
        />
      </FadeUp>
    </section>

    <section className="relative mx-auto max-w-[1440px] px-5 pb-24 lg:px-8 lg:pb-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img src={archHouseRoof} alt="" aria-hidden className="absolute -right-40 top-0 hidden w-[720px] opacity-[0.22] mix-blend-multiply lg:block" />
      </div>
      {adminProjects !== null && (
        <StackedProjects
          key={active}
          items={visible.map(p => ({ category: p.type, title: p.name, description: `${p.city} · ${p.year}`, image: p.image }))}
        />
      )}
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
