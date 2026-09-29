/**
 * Stacking cards on scroll ("sticky card stack").
 * Each card is `position: sticky` just under the fixed header; as the next
 * card slides up over it, the covered card scales down slightly — driven
 * straight off scroll progress (Motion), no DOM-mutating pin setup, so
 * React re-renders can never leave a card stuck over later sections.
 */
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { SplitButton } from "@/components/ui/split-button";
import decoHouseElevation from "@/assets/decor/deco-house-elevation.webp";
import decoCrane from "@/assets/decor/deco-crane.webp";
import decoBlueprintRolls from "@/assets/decor/deco-blueprint-rolls.webp";
import decoSiteAerialDark from "@/assets/decor/deco-site-aerial-dark.webp";

export type StackedProject = {
  category: string;
  title: string;
  description: string;
  image: string;
  // Optional — only historical projects with a real detail page get one.
  // Admin-added projects and the homepage teaser simply omit it.
  href?: string;
};

// The fixed site header is 88px tall — cards stick just beneath it instead of sliding under it.
const HEADER_OFFSET = 88;

// Distinct tones per card, built from the site's own design tokens (not
// arbitrary colors) so this matches everything else in the app: the light
// card, the dark card, and the brand-red card, cycling in that order.
const TONES = [
  {
    bg: "bg-background",
    text: "text-foreground",
    muted: "text-muted-foreground",
    deco: decoHouseElevation,
    blend: "mix-blend-multiply" as const,
    decoOpacity: "opacity-25",
  },
  {
    bg: "bg-foreground",
    text: "text-background",
    muted: "text-background/60",
    deco: decoSiteAerialDark,
    // This asset is black line-art on white/transparent, same as the others —
    // neither multiply nor screen can make black lines visible on a black
    // card (both are no-ops on black-on-black). Invert it to white line-art
    // first, then plain opacity actually shows it.
    blend: "invert",
    decoOpacity: "opacity-40",
  },
  {
    bg: "bg-primary",
    text: "text-primary-foreground",
    muted: "text-primary-foreground/70",
    deco: decoCrane,
    blend: "mix-blend-multiply" as const,
    decoOpacity: "opacity-30",
  },
];

// A second decoration used on the light card only, cycling with house elevation
// so consecutive light cards (index 0, 3, 6...) don't repeat the exact same motif.
const LIGHT_DECOS = [decoHouseElevation, decoBlueprintRolls];

function StackedCard({
  p,
  i,
  total,
  progress,
  headerOffset,
  tilt,
}: {
  p: StackedProject;
  i: number;
  total: number;
  progress: MotionValue<number>;
  headerOffset: number;
  tilt: boolean;
}) {
  const tone = TONES[i % TONES.length]!;
  const reduce = useReducedMotion();
  // The covered card settles slightly smaller the deeper it sits in the pile,
  // tilting left/right alternately like the old pin version.
  const targetScale = 1 - (total - i) * 0.05;
  const targetRotate = i % 2 === 0 ? -2 : 2;
  const scale = useTransform(progress, [i / total, 1], [1, targetScale]);
  const rotate = useTransform(progress, [i / total, 1], [0, targetRotate]);

  // The photo eases from a slight zoom as its own card travels into place.
  const selfRef = useRef<HTMLElement>(null);
  const { scrollYProgress: enter } = useScroll({
    target: selfRef,
    offset: ["start end", "start start"],
  });
  const imgScale = useTransform(enter, [0, 1], [1.25, 1]);

  return (
    <article
      ref={selfRef}
      className="sticky w-full"
      style={{ top: headerOffset, height: `calc(100svh - ${headerOffset}px)`, zIndex: i + 1 }}
    >
      <motion.div
        className={`relative flex h-full w-full flex-col justify-between overflow-hidden px-6 py-8 will-change-transform lg:px-16 lg:py-12 ${tone.bg} ${tone.text}`}
        style={{
          scale: reduce ? 1 : scale,
          rotate: reduce || !tilt ? 0 : rotate,
          transformOrigin: "50% 0%",
        }}
      >
        <img
          src={
            i % TONES.length === 0
              ? LIGHT_DECOS[Math.floor(i / TONES.length) % LIGHT_DECOS.length]
              : tone.deco
          }
          alt=""
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-[18%] top-[30%] mx-auto w-[85%] object-contain lg:w-[70%] ${tone.blend === "invert" ? "" : tone.blend} ${tone.decoOpacity}`}
          style={tone.blend === "invert" ? { filter: "invert(1)" } : undefined}
        />
        <div className="relative flex min-h-0 flex-1 flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <h2 className="font-display text-[9vw] font-bold uppercase leading-[0.9] sm:text-[7vw] lg:shrink-0 lg:text-[7vw]">
            {p.category}
          </h2>
          <div className="aspect-[16/10] max-h-[32svh] w-full min-h-0 overflow-hidden rounded-[2.5rem] lg:w-[40%]">
            <motion.img
              src={p.image}
              alt={p.title}
              loading="lazy"
              width={900}
              height={560}
              style={{ scale: reduce ? 1 : imgScale }}
              className="h-full w-full object-cover will-change-transform"
            />
          </div>
        </div>
        <div className="relative flex shrink-0 items-end justify-between gap-6 pt-6">
          <span className={`font-display text-6xl font-bold lg:text-8xl ${tone.muted}`}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="max-w-md">
            <h3 className="font-display text-2xl font-bold lg:text-3xl">{p.title}</h3>
            <p className={`mt-3 text-base leading-relaxed lg:text-lg ${tone.muted}`}>
              {p.description}
            </p>
            {p.href && (
              <SplitButton href={p.href} dark={i % TONES.length === 2} className="mt-5">
                Voir le projet
              </SplitButton>
            )}
          </div>
        </div>
      </motion.div>
    </article>
  );
}

export function StackedProjects({
  items,
  headerOffset = HEADER_OFFSET,
  tilt = false,
}: {
  items: StackedProject[];
  headerOffset?: number;
  /** alternating left/right settle tilt — landing page only */
  tilt?: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  const { scrollYProgress: progress } = useScroll({
    target: root,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={root} className="relative">
      {items.map((p, i) => (
        <StackedCard
          key={`${p.category}-${p.title}`}
          p={p}
          i={i}
          total={items.length}
          progress={progress}
          headerOffset={headerOffset}
          tilt={tilt}
        />
      ))}
    </section>
  );
}
