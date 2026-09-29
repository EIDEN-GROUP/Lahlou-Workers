// Stack-spread gallery (scroll-driven cluster -> scatter).
// Adapted from Hyperiux Vault for Lahlou Workers: local WebP assets, French
// copy, site tokens (light bg, dark ink, sharp corners), no remote images.
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import projectMissimi from "@/assets/lahlou-project.webp";
import projectR5 from "@/assets/galerie-chantier-aerien.webp";
import projectVilla from "@/assets/lahlou-team.webp";
import projectCraft from "@/assets/lahlou-craft.webp";
import projectHero from "@/assets/lahlou-hero.webp";
import projectService from "@/assets/service-gros-oeuvre.webp";
import projectMethode from "@/assets/methode-coordination-equipe.webp";

// ---------------------------------------------------------------------------
// Default cards (other finished sites — the "Chantiers livrés" gallery)
// ---------------------------------------------------------------------------

const DEFAULT_CARDS: StackSpreadCard[] = [
  {
    item: { src: projectR5, alt: "Immeuble R+5 en dalle post-tension, Agadir" },
    stackOffset: { x: 14, y: -10 },
    stackRotate: 20,
    target: { x: 32, y: -30, rotate: 0, scale: 0.9, w: 18, h: 32 },
    targetSm: { x: 22, y: -40 },
    z: 3,
  },
  {
    item: { src: projectVilla, alt: "Villa avec piscine, Agadir" },
    stackOffset: { x: -16, y: 0 },
    stackRotate: -4,
    target: { x: -36, y: -2, rotate: 0, scale: 0.9, w: 15, h: 32 },
    targetSm: { x: -22, y: -19 },
    z: 4,
  },
  {
    item: { src: projectHero, alt: "Rénovation du siège administratif, Agadir" },
    stackOffset: { x: 1, y: -10 },
    stackRotate: -2,
    target: { x: 6, y: -32, rotate: 0, scale: 0.8, w: 25, h: 30 },
    targetSm: { x: 22, y: -19 },
    z: 5,
  },
  {
    item: { src: projectCraft, alt: "Gros œuvre et VRD, cimenterie de Tan-Tan" },
    stackOffset: { x: 18, y: 1 },
    stackRotate: 6,
    target: { x: 37, y: 6, rotate: 0, scale: 0.8, w: 18, h: 32 },
    targetSm: { x: -22, y: 20 },
    z: 6,
  },
  {
    item: { src: projectMethode, alt: "Coordination des équipes sur chantier" },
    stackOffset: { x: -6, y: 10 },
    stackRotate: 6,
    target: { x: -24, y: 34, rotate: 0, scale: 0.9, w: 22, h: 25 },
    targetSm: { x: 22, y: 20 },
    z: 7,
  },
  {
    item: { src: projectService, alt: "Aménagement de bureaux, Agadir" },
    stackOffset: { x: 8, y: 7 },
    stackRotate: 3,
    target: { x: 2, y: 36, rotate: 0, scale: 0.8, w: 20, h: 26 },
    targetSm: { x: -22, y: 40 },
    z: 8,
  },
  {
    item: { src: projectMissimi, alt: "Résidences MISSIMI, Agadir" },
    stackOffset: { x: 20, y: 12 },
    stackRotate: -7,
    target: { x: 30, y: 34, rotate: 0, scale: 0.9, w: 16, h: 20 },
    targetSm: { x: 22, y: 40 },
    z: 9,
  },
];

// ---------------------------------------------------------------------------
// Mechanism
// ---------------------------------------------------------------------------

// Scroll progress where the cluster starts scattering and where it finishes.
const SCATTER_START = 0.12;
const SCATTER_END = 0.9;

const PARALLAX_X = 2.6;
const PARALLAX_Y = 2.2;
const PARALLAX_SPRING = { stiffness: 90, damping: 22, mass: 0.6 };
const parallaxDepth = (i: number, total: number) =>
  total <= 1 ? 1 : 0.55 + (i / (total - 1)) * 0.75;

/**
 * Small-screen grid geometry, in vw/vh.
 * `band` is the clear horizontal strip kept free through the middle of the
 * viewport for the headline + subtitle + CTA — the cards are laid out above
 * and below it, never inside it.
 */
type SmallGrid = { colX: number; cardH: number; rowGap: number; band: number };

const RESPONSIVE = {
  desktop: {
    scale: null as number | null,
    small: false,
    card: null as { w: number; h: number } | null,
    grid: null as SmallGrid | null,
  },
  tablet: {
    scale: 1,
    small: true,
    card: { w: 30, h: 15 },
    grid: { colX: 17, cardH: 15, rowGap: 2, band: 30 },
  },
  phone: {
    scale: 1,
    small: true,
    card: { w: 40, h: 14 },
    grid: { colX: 22, cardH: 14, rowGap: 2, band: 34 },
  },
};

function useResponsive() {
  const [r, setR] = useState(RESPONSIVE.desktop);
  useEffect(() => {
    // Touch devices always get the stacked column layout, but so does any
    // viewport too narrow for the desktop scatter to fit — a 600px-wide
    // desktop window has the same collision problem a phone does.
    const phone = window.matchMedia("(max-width: 767px)");
    const tablet = window.matchMedia("(max-width: 1024px)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const read = () => {
      if (phone.matches) setR(RESPONSIVE.phone);
      else if (tablet.matches || coarse.matches) setR(RESPONSIVE.tablet);
      else setR(RESPONSIVE.desktop);
    };
    read();
    const list = [phone, tablet, coarse];
    list.forEach((m) => m.addEventListener("change", read));
    return () => list.forEach((m) => m.removeEventListener("change", read));
  }, []);
  return r;
}

/**
 * Resting positions for the small-screen layout: a real 2-column grid derived
 * from card order, with `band` vh kept clear through the middle.
 *
 * The cards' own `targetSm` values can't express this — their inner rows sit
 * ~19vh from centre, so with any reasonable card height the headline and CTA
 * end up overlapping the photos. Computing the grid here fixes it for every
 * caller at once, whatever `targetSm` they pass.
 */
function smallGridPositions(total: number, g: SmallGrid) {
  const rows = Math.ceil(total / 2);
  const above = Math.floor(rows / 2);
  const rowY = Array.from({ length: rows }, (_, r) => {
    const isAbove = r < above;
    const dist = isAbove ? above - 1 - r : r - above;
    const offset = g.band / 2 + g.cardH / 2 + dist * (g.cardH + g.rowGap);
    return isAbove ? -offset : offset;
  });

  return Array.from({ length: total }, (_, i) => {
    // An odd last card has no partner — centre it instead of leaving a hole.
    const alone = i === total - 1 && total % 2 === 1;
    return {
      x: alone ? 0 : i % 2 === 0 ? g.colX : -g.colX,
      y: rowY[Math.floor(i / 2)] ?? 0,
    };
  });
}

function usePointerParallax(active: boolean, enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, PARALLAX_SPRING);
  const y = useSpring(rawY, PARALLAX_SPRING);

  useEffect(() => {
    if (!enabled) return;

    if (!active) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    const onMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth) * 2 - 1);
      rawY.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [active, enabled, rawX, rawY]);

  return { x, y };
}

export interface StackSpreadItem {
  src: string;
  alt?: string;
}

export interface StackSpreadTarget {
  x: number;
  y: number;
  rotate: number;
  scale?: number;
  w: number;
  h: number;
}

export interface StackSpreadCard {
  item: StackSpreadItem;
  target: StackSpreadTarget;
  /** final x/y (vw/vh) for tablet + mobile; falls back to `target` */
  targetSm?: { x: number; y: number };
  /** angle while clustered */
  stackRotate?: number;
  /** offset while clustered (vw/vh) */
  stackOffset?: { x: number; y: number };
  /** paint order, higher on top */
  z?: number;
}

function Card({
  card,
  progress,
  reduce,
  clusterRotation,
  scaleMul,
  smallPos,
  fixedCard,
  stackScale,
  cardRadius,
  pointer,
  depth,
}: {
  card: StackSpreadCard;
  progress: MotionValue<number>;
  reduce: boolean | null;
  clusterRotation: boolean;
  /** uniform rest-scale for every card; null = use each card's own scale */
  scaleMul: number | null;
  /** resting spot on the small-screen grid; null = desktop scatter */
  smallPos: { x: number; y: number } | null;
  fixedCard: { w: number; h: number } | null;
  /** scale of the cards while clustered, before the scatter */
  stackScale: number;
  /** corner radius on each card, in px */
  cardRadius: number;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  depth: number;
}) {
  const { item, target } = card;

  const flat = reduce === true;
  const stackRotate = flat ? 0 : clusterRotation ? (card.stackRotate ?? 0) : 0;
  const stackOffset = card.stackOffset ?? { x: 0, y: 0 };
  const restScale = scaleMul ?? target.scale ?? 1;

  // final resting spot: column grid on small screens, scatter on desktop
  const endX = smallPos ? smallPos.x : target.x;
  const endY = smallPos ? smallPos.y : target.y;
  const endRotate = flat || smallPos ? 0 : target.rotate;

  // -50% keeps card centred on its anchor
  const translate = useTransform([progress, pointer.x, pointer.y], (values: number[]) => {
    const [p = 0, px = 0, py = 0] = values;
    const tx = stackOffset.x + (endX - stackOffset.x) * p;
    const ty = stackOffset.y + (endY - stackOffset.y) * p;
    const drift = depth * p;
    const dx = tx - px * PARALLAX_X * drift;
    const dy = ty - py * PARALLAX_Y * drift;
    return `calc(-50% + ${dx}vw) calc(-50% + ${dy}vh)`;
  });
  const rotate = useTransform(progress, [0, 1], [stackRotate, endRotate]);
  const scale = useTransform(progress, [0, 1], [stackScale, restScale]);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 will-change-transform"
      style={{
        width: `${fixedCard ? fixedCard.w : target.w}vw`,
        height: `${fixedCard ? fixedCard.h : target.h}vh`,
        zIndex: card.z ?? 1,
        translate,
        rotate,
        scale,
      }}
    >
      <CardFace item={item} cardRadius={cardRadius} />
    </motion.div>
  );
}

function CardFace({ item, cardRadius }: { item: StackSpreadItem; cardRadius: number }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ borderRadius: `${cardRadius}px` }}
    >
      <img
        src={item.src}
        alt={item.alt ?? ""}
        draggable={false}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

interface StackSpreadStageProps {
  cards: StackSpreadCard[];
  /** scatter scroll distance, in vh */
  scrollLength?: number;
  bgColor?: string;
  /** fan the clustered stack (default) or start flat */
  clusterRotation?: boolean;
  /** scale of the cards while clustered, before the scatter */
  stackScale?: number;
  /** corner radius on each card, in px */
  cardRadius?: number;
  /** centre headline */
  title?: ReactNode;
  /** centre subtitle */
  subtitle?: ReactNode;
  /** call-to-action rendered under the centre text */
  cta?: ReactNode;
  /** color of the centre headline and subtitle */
  textColor?: string;
  /** scroll progress (0-1) where the centre text starts fading in */
  textFadeStart?: number;
  /** show the "scroll to spread" hint at the bottom until the scatter begins */
  showScrollHint?: boolean;
  className?: string;
}

function StackSpreadStage({
  cards,
  scrollLength = 350,
  bgColor = "#F9F9F9",
  clusterRotation = true,
  stackScale = 0.82,
  cardRadius = 0,
  title,
  subtitle,
  cta,
  textColor = "#0A0A0A",
  textFadeStart = 0.3,
  showScrollHint = true,
  className,
}: StackSpreadStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scale: scaleMul, small: isSmall, card: fixedCard, grid } = useResponsive();
  const smallPositions = isSmall && grid ? smallGridPositions(cards.length, grid) : null;

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  // hold, scatter, then settle
  const progress = useTransform(scrollYProgress, [0, SCATTER_START, SCATTER_END, 1], [0, 0, 1, 1]);

  // centre text always fades in on scroll; the scale-in is dropped only when
  // reduced motion is confirmed (`true`), not on the null SSR value.
  const [spread, setSpread] = useState(false);
  useMotionValueEvent(progress, "change", (p) => {
    setSpread((was) => (was ? p > 0.985 : p >= 0.999));
  });
  const parallaxEnabled = reduce !== true && !isSmall;
  const pointer = usePointerParallax(spread, parallaxEnabled);

  const noScale = reduce === true;
  const copyOpacity = useTransform(progress, [textFadeStart, textFadeStart + 0.35], [0, 1]);
  const copyScale = useTransform(progress, [textFadeStart, 0.9], [0.85, 1]);

  // scroll hint: visible while clustered, gone by the time the scatter starts
  const hintOpacity = useTransform(progress, [0, SCATTER_START], [1, 0]);

  return (
    <section
      ref={wrapRef}
      className={cn("relative w-full", className)}
      style={{ height: `${scrollLength}vh`, backgroundColor: bgColor }}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* centre text — above the cards so the CTA stays clickable */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-[15] flex flex-col items-center justify-center px-6 text-center max-md:px-8"
          style={{
            opacity: copyOpacity,
            scale: noScale ? 1 : copyScale,
          }}
        >
          <h2
            className="w-full whitespace-pre-line font-display text-[4.5vw] font-bold uppercase leading-[0.95] tracking-tight max-md:text-[8.5vw] md:max-lg:text-[5.5vw]"
            style={{ color: textColor }}
          >
            {title}
          </h2>
          <p
            className="mt-[1.2vw] w-full max-w-[42ch] text-[1.15vw] leading-relaxed tracking-tight max-md:mt-3 max-md:text-[3.4vw] md:max-lg:mt-2 md:max-lg:text-[1.9vw]"
            style={{ color: textColor, opacity: 0.6 }}
          >
            {subtitle}
          </p>
          {cta && (
            <div className="pointer-events-auto mt-8 flex justify-center max-md:mt-5">{cta}</div>
          )}
        </motion.div>

        {/* scattering cards */}
        <div className="absolute inset-0 z-10">
          {cards.map((card, i) => (
            <Card
              key={i}
              card={card}
              progress={progress}
              reduce={reduce}
              clusterRotation={clusterRotation}
              scaleMul={scaleMul}
              smallPos={smallPositions?.[i] ?? null}
              fixedCard={fixedCard}
              stackScale={stackScale}
              cardRadius={cardRadius}
              pointer={pointer}
              depth={parallaxEnabled ? parallaxDepth(i, cards.length) : 0}
            />
          ))}
        </div>

        {/* scroll hint */}
        {showScrollHint && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-[3vh] z-20 flex flex-col items-center gap-[0.6vh] text-[0.8vw] font-medium uppercase tracking-[0.2em] max-md:bottom-6 max-md:gap-1 max-md:text-[2.8vw] md:max-lg:text-[1.3vw]"
            style={{ color: textColor, opacity: hintOpacity }}
          >
            <span>Défiler</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-bounce max-md:h-[4vw] max-md:w-[4vw]"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export interface StackSpreadProps {
  cards?: StackSpreadCard[];
  /** scatter scroll distance, in vh */
  scrollLength?: number;
  bgColor?: string;
  /** fan the clustered stack (default) or start flat */
  clusterRotation?: boolean;
  /** scale of the cards while clustered, before the scatter */
  stackScale?: number;
  /** corner radius on each card, in px */
  cardRadius?: number;
  /** centre headline */
  title?: ReactNode;
  /** centre subtitle */
  subtitle?: ReactNode;
  /** call-to-action rendered under the centre text */
  cta?: ReactNode;
  /** color of the centre headline and subtitle */
  textColor?: string;
  /** scroll progress (0-1) where the centre text starts fading in */
  textFadeStart?: number;
  /** show the "scroll to spread" hint at the bottom until the scatter begins */
  showScrollHint?: boolean;
  className?: string;
}

export default function StackSpread({
  cards = DEFAULT_CARDS,
  scrollLength = 350,
  bgColor = "#F9F9F9",
  clusterRotation = true,
  stackScale = 0.82,
  cardRadius = 0,
  title = "Chantiers livrés.",
  subtitle = "Du gros œuvre à la livraison, partout au Maroc.",
  cta,
  textColor = "#0A0A0A",
  textFadeStart = 0.3,
  showScrollHint = true,
  className,
}: StackSpreadProps) {
  return (
    <StackSpreadStage
      cards={cards}
      scrollLength={scrollLength}
      bgColor={bgColor}
      clusterRotation={clusterRotation}
      stackScale={stackScale}
      cardRadius={cardRadius}
      title={title}
      subtitle={subtitle}
      cta={cta}
      textColor={textColor}
      textFadeStart={textFadeStart}
      showScrollHint={showScrollHint}
      {...(className !== undefined ? { className } : {})}
    />
  );
}
