/**
 * Stacking cards on scroll ("sticky card stack").
 * Each card pins to the screen; as the next card slides up over it,
 * the card underneath shrinks and tilts slightly, alternating left/right,
 * darkening as it recedes. Built on GSAP ScrollTrigger — this is the real
 * mechanism (pin + scrub, not a scroll-progress approximation).
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SplitButton } from "@/components/ui/split-button";
import decoHouseElevation from "@/assets/decor/deco-house-elevation.webp";
import decoCrane from "@/assets/decor/deco-crane.webp";
import decoBlueprintRolls from "@/assets/decor/deco-blueprint-rolls.webp";
import decoSiteAerialDark from "@/assets/decor/deco-site-aerial-dark.webp";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type StackedProject = {
  category: string;
  title: string;
  description: string;
  image: string;
  // Optional — only historical projects with a real detail page get one.
  // Admin-added projects and the homepage teaser simply omit it.
  href?: string;
};

// How much the covered card shrinks and tilts (tweak to taste). No darkening
// filter — the covered card stays fully colorful/legible while it recedes,
// matching the reference (vault.hyperiux.com/demo/stacking-cards).
const SCALE_TO = 0.92;
const TILT_DEG = 2;
const TILT_BACK_DEG = 6;
const PERSPECTIVE = 1200;
const CORNER_RADIUS = "3vw";

// The fixed site header is 88px tall — cards pin just beneath it instead of sliding under it.
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

export function StackedProjects({
  items,
  headerOffset = HEADER_OFFSET,
}: {
  items: StackedProject[];
  headerOffset?: number;
}) {
  const root = useRef<HTMLElement>(null);
  // Parents often rebuild the `items` array inline on every render (e.g. a
  // .map() in JSX, or any state change like an FAQ toggle). Re-running the pin
  // setup for an identical list tears down live pins mid-scroll and can leave
  // a card stuck `position: fixed` over later sections — so the effect only
  // re-runs when the actual card content changes.
  const sig = items.map((p) => `${p.category}|${p.title}|${p.description}|${p.image}`).join("||");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".stack-card");
        const last = cards[cards.length - 1];
        if (!last) return;

        cards.forEach((card, i) => {
          if (i === cards.length - 1) return;

          ScrollTrigger.create({
            trigger: card,
            start: `top ${headerOffset}px`,
            endTrigger: last,
            end: `top ${headerOffset}px`,
            pin: true,
            pinSpacing: false,
          });

          const next = cards[i + 1];
          if (!next) return;
          const coverTrigger = {
            trigger: next,
            start: "top bottom",
            end: "top top",
            scrub: true,
          };

          gsap.fromTo(
            card.querySelector(".stack-card-inner"),
            { borderRadius: "0vw" },
            {
              scale: SCALE_TO,
              rotation: i % 2 === 0 ? -TILT_DEG : TILT_DEG,
              rotationX: TILT_BACK_DEG,
              transformPerspective: PERSPECTIVE,
              transformOrigin: "50% 100%",
              borderRadius: CORNER_RADIUS,
              ease: "none",
              scrollTrigger: coverTrigger,
            },
          );

          gsap.fromTo(
            next.querySelector(".stack-card-img"),
            { scale: 1.25 },
            { scale: 1, ease: "none", scrollTrigger: coverTrigger },
          );
        });
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [sig, headerOffset] },
  );

  // Pin positions are measured at setup; late-loading images and webfonts can
  // shift layout afterwards, so re-measure once everything settles.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => {});
    return () => window.removeEventListener("load", refresh);
  }, []);

  return (
    <section ref={root} className="relative">
      {items.map((p, i) => {
        const tone = TONES[i % TONES.length]!;
        return (
          <article
            key={`${p.category}-${p.title}`}
            className="stack-card relative w-full"
            style={{ zIndex: i + 1, height: `calc(100svh - ${headerOffset}px)` }}
          >
            <div
              className={`stack-card-inner relative flex h-full w-full flex-col justify-between overflow-hidden px-6 py-10 will-change-transform lg:px-16 lg:py-16 ${tone.bg} ${tone.text}`}
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
              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                <h2 className="font-display text-[9vw] font-bold uppercase leading-[0.9] sm:text-[7vw] lg:text-[7vw]">
                  {p.category}
                </h2>
                <div className="aspect-[16/10] w-full overflow-hidden rounded-[2.5rem] lg:w-[40%]">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    width={900}
                    height={560}
                    className="stack-card-img h-full w-full object-cover will-change-transform"
                  />
                </div>
              </div>
              <div className="relative flex items-end justify-between gap-6">
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
            </div>
          </article>
        );
      })}
    </section>
  );
}
