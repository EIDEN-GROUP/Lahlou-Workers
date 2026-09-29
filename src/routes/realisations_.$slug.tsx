import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Eyebrow, PageShell } from "@/components/site-chrome";
import { SplitButton } from "@/components/ui/split-button";
import { FadeUp, FloatingCircleLink } from "@/components/scroll-fx";
import { HorizontalTimeline } from "@/components/ui/horizontal-timeline";
import StackSpread, { type StackSpreadCard } from "@/components/ui/stack-spread";
import { ProjectTimeline } from "@/components/project-timeline";
import { PROJECT_STEPS } from "@/lib/project-steps";
import projectImage from "@/assets/lahlou-project.webp";
import projectR5 from "@/assets/galerie-chantier-aerien.webp";
import projectVilla from "@/assets/lahlou-team.webp";
import projectCraft from "@/assets/lahlou-craft.webp";
import projectHero from "@/assets/lahlou-hero.webp";
import projectService from "@/assets/service-gros-oeuvre.webp";
import stepSurveying from "@/assets/decor/step-surveying.webp";
import stepFoundation from "@/assets/decor/step-foundation.webp";
import stepConcretePour from "@/assets/decor/step-concrete-pour.webp";
import stepStructuralFrame from "@/assets/decor/step-structural-frame.webp";
import stepFacade from "@/assets/decor/step-facade.webp";
import stepFloorplan from "@/assets/decor/step-floorplan.webp";
import stepChecklist from "@/assets/decor/step-checklist.webp";
import stepHandover from "@/assets/decor/step-handover.webp";
import stepDrone from "@/assets/decor/step-drone.webp";
import resultFacadeHero from "@/assets/results/result-facade-hero.webp";
import resultVillaPool from "@/assets/results/result-villa-pool.webp";
import resultInterior from "@/assets/results/result-interior.webp";
import resultAerial from "@/assets/results/result-aerial.webp";
import resultEntrance from "@/assets/results/result-entrance.webp";
import resultRooftop from "@/assets/results/result-rooftop.webp";
import resultDetail from "@/assets/results/result-detail.webp";
import decoStepArrow from "@/assets/decor/deco-step-arrow.webp";

export const Route = createFileRoute("/realisations_/$slug")({
  loader: ({ params }) => {
    const project = projectDetails[params.slug];
    if (!project) throw notFound();
    return project;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} | Lahlou Workers` },
          { name: "description", content: loaderData.summary },
        ]
      : [],
  }),
  component: ProjectDetail,
});

const steps = [
  {
    title: "Levé topographique",
    text: "Relevé du terrain, implantation des repères, vérification des limites avant tout coup de pioche.",
    image: stepSurveying,
  },
  {
    title: "Fondations",
    text: "Terrassement et coulage des fondations, calculées pour la nature du sol et la charge du bâtiment.",
    image: stepFoundation,
  },
  {
    title: "Coulage béton",
    text: "Coffrage et coulage des éléments porteurs, suivi de la prise et du décoffrage à chaque niveau.",
    image: stepConcretePour,
  },
  {
    title: "Structure",
    text: "Montage de l’ossature R+5 : poteaux, poutres, dalles - post-tension pour les grandes portées.",
    image: stepStructuralFrame,
  },
  {
    title: "Façade",
    text: "Enduits, isolation et finitions extérieures, jusqu’au dernier balcon.",
    image: stepFacade,
  },
  {
    title: "Plans & second œuvre",
    text: "Cloisons, réseaux électriques et plomberie posés selon les plans validés en amont.",
    image: stepFloorplan,
  },
  {
    title: "Contrôle qualité",
    text: "Check-list complète avant livraison : chaque lot vérifié, chaque non-conformité corrigée.",
    image: stepChecklist,
  },
  {
    title: "Livraison",
    text: "Remise des clés au client, dossier technique complet à l’appui.",
    image: stepHandover,
  },
];

const gallery = [
  { src: resultFacadeHero, alt: "Façade de la résidence terminée, lumière du soir" },
  { src: resultAerial, alt: "Vue aérienne de la résidence livrée" },
  { src: resultEntrance, alt: "Entrée principale de la résidence" },
  { src: resultInterior, alt: "Intérieur d’un appartement livré" },
  { src: resultRooftop, alt: "Terrasse en toiture avec vue sur la ville" },
  { src: resultVillaPool, alt: "Villa avec piscine, projet complémentaire" },
  { src: resultDetail, alt: "Détail de finition en façade" },
];

const projectDetails: Record<
  string,
  {
    name: string;
    city: string;
    year: string;
    type: string;
    summary: string;
    hero: string;
    next: { slug: string; name: string };
  }
> = {
  "residences-missimi": {
    name: "Résidences MISSIMI",
    city: "Agadir",
    year: "2025",
    type: "Résidentiel",
    summary: "Ensemble résidentiel R+5 livré clé en main à Agadir : gros œuvre, VRD et finitions.",
    hero: projectImage,
    next: { slug: "immeuble-r-plus-5", name: "Immeuble R+5 en post-tension" },
  },
  "immeuble-r-plus-5": {
    name: "Immeuble R+5 en post-tension",
    city: "Agadir",
    year: "2024",
    type: "Résidentiel",
    summary:
      "Construction d’un immeuble en R+5 en dalle post-tension : lots gros œuvre et terrassement.",
    hero: projectR5,
    next: { slug: "villas-piscines", name: "3 villas avec piscines" },
  },
  "villas-piscines": {
    name: "3 villas avec piscines",
    city: "Agadir",
    year: "2024",
    type: "Résidentiel",
    summary:
      "Terrassement et gros œuvre de 3 villas avec piscines, jusqu’aux finitions haut de gamme.",
    hero: projectVilla,
    next: { slug: "usine-ciment-tan-tan", name: "Cimenterie de Tan-Tan" },
  },
  "usine-ciment-tan-tan": {
    name: "Cimenterie de Tan-Tan",
    city: "Tan-Tan",
    year: "2024",
    type: "Industriel",
    summary:
      "Travaux de gros œuvre et de VRD d’une usine de ciment à Tan-Tan, espaces verts compris.",
    hero: projectCraft,
    next: { slug: "siege-administratif", name: "Siège Lahlou Workers" },
  },
  "siege-administratif": {
    name: "Siège Lahlou Workers",
    city: "Agadir",
    year: "2023",
    type: "Rénovation",
    summary: "Travaux d’aménagement du siège de LAHLOU WORKERS, en site occupé.",
    hero: projectHero,
    next: { slug: "bureaux-orosand", name: "Bureaux OROSAND INVEST" },
  },
  "bureaux-orosand": {
    name: "Bureaux OROSAND INVEST",
    city: "Agadir",
    year: "2023",
    type: "Commercial",
    summary: "Travaux d’aménagement de bureaux tous corps d’état, ameublement compris.",
    hero: projectService,
    next: { slug: "residences-missimi", name: "Résidences MISSIMI" },
  },
};

// Scatter positions for the "Le chantier livré." gallery — same 7 slots the
// site-wide spread uses, filled here with this project's own photos.
const SCATTER_PRESETS: Omit<StackSpreadCard, "item">[] = [
  {
    stackOffset: { x: 14, y: -10 },
    stackRotate: 20,
    target: { x: 32, y: -30, rotate: 0, scale: 0.9, w: 18, h: 32 },
    targetSm: { x: 22, y: -40 },
    z: 3,
  },
  {
    stackOffset: { x: -16, y: 0 },
    stackRotate: -4,
    target: { x: -36, y: -2, rotate: 0, scale: 0.9, w: 15, h: 32 },
    targetSm: { x: -22, y: -19 },
    z: 4,
  },
  {
    stackOffset: { x: 1, y: -10 },
    stackRotate: -2,
    target: { x: 6, y: -32, rotate: 0, scale: 0.8, w: 25, h: 30 },
    targetSm: { x: 22, y: -19 },
    z: 5,
  },
  {
    stackOffset: { x: 18, y: 1 },
    stackRotate: 6,
    target: { x: 37, y: 6, rotate: 0, scale: 0.8, w: 18, h: 32 },
    targetSm: { x: -22, y: 20 },
    z: 6,
  },
  {
    stackOffset: { x: -6, y: 10 },
    stackRotate: 6,
    target: { x: -24, y: 34, rotate: 0, scale: 0.9, w: 22, h: 25 },
    targetSm: { x: 22, y: 20 },
    z: 7,
  },
  {
    stackOffset: { x: 8, y: 7 },
    stackRotate: 3,
    target: { x: 2, y: 36, rotate: 0, scale: 0.8, w: 20, h: 26 },
    targetSm: { x: -22, y: 40 },
    z: 8,
  },
  {
    stackOffset: { x: 20, y: 12 },
    stackRotate: -7,
    target: { x: 30, y: 34, rotate: 0, scale: 0.9, w: 16, h: 20 },
    targetSm: { x: 22, y: 40 },
    z: 9,
  },
];

function ProjectDetail() {
  const project = Route.useLoaderData();
  const { slug } = Route.useParams();
  // Only MISSIMI has its own photo set — the other pages spread the
  // all-sites gallery instead of showing another project's chantier.
  const scatterCards =
    slug === "residences-missimi"
      ? gallery.map((g, i) => ({
          item: g,
          ...(SCATTER_PRESETS[i % SCATTER_PRESETS.length] as Omit<StackSpreadCard, "item">),
        }))
      : undefined;

  return (
    <PageShell header="hero">
      <section className="relative min-h-[70svh] overflow-hidden bg-foreground text-background">
        <img
          src={project.hero}
          alt={project.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/55" />
        <div className="relative mx-auto flex min-h-[70svh] max-w-[1440px] flex-col justify-end px-5 pb-16 pt-32 lg:px-8">
          <FadeUp>
            <Eyebrow label={project.type} />
            <h1 className="mt-6 font-display text-[32px] font-bold leading-[0.95] lg:text-[56px]">
              {project.name}
            </h1>
            <p className="mt-4 text-background/70">
              {project.city} · {project.year}
            </p>
          </FadeUp>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1440px] px-5 pt-16 lg:px-8">
        <FadeUp>
          <Eyebrow label="Étapes suivies" />
          <h2 className="mt-4 font-display text-2xl font-bold lg:text-4xl">
            Comment ce chantier a été livré.
          </h2>
        </FadeUp>
      </section>

      {slug === "residences-missimi" ? (
        <HorizontalTimeline
          items={steps}
          className="pb-16 lg:pb-24"
          getLabel={(_step, i) => String(i + 1).padStart(2, "0")}
          renderContent={(step) => (
            <div>
              <h3 className="font-display text-lg font-bold lg:text-xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          )}
        />
      ) : (
        <ProjectTimeline steps={PROJECT_STEPS[slug] ?? []} />
      )}

      <StackSpread
        title="Le chantier livré."
        subtitle={`${project.name}, du gros œuvre aux finitions - clé en main.`}
        cta={<SplitButton href="/devis">Demander un devis similaire</SplitButton>}
        {...(scatterCards ? { cards: scatterCards } : {})}
      />

      <section
        id="next"
        className="relative overflow-hidden bg-muted py-24 text-foreground lg:py-36"
      >
        <img
          src={decoStepArrow}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-10 hidden w-[420px] opacity-[0.22] mix-blend-multiply lg:block"
        />
        <div className="relative mx-auto flex max-w-[1440px] flex-col items-center px-5 text-center lg:px-8">
          <FadeUp className="flex justify-center">
            <Eyebrow label="Projet suivant" />
          </FadeUp>
          <FadeUp delay={0.1} className="mt-10 flex justify-center">
            <FloatingCircleLink
              href={`/realisations/${project.next.slug}`}
              image={project.hero}
              alt={project.next.name}
              label="Voir le projet"
            />
          </FadeUp>
          <FadeUp delay={0.2}>
            <h2 className="mx-auto mt-12 max-w-3xl font-display text-[28px] font-bold uppercase leading-[0.95] lg:text-[56px]">
              {project.next.name}
            </h2>
          </FadeUp>
          <FadeUp delay={0.3} className="mt-6 flex justify-center">
            <Link
              to="/realisations"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Retour aux réalisations
            </Link>
          </FadeUp>
        </div>
      </section>
    </PageShell>
  );
}
