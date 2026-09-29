/**
 * Flip card stack — a deck of photos that fans open on click, and swaps any
 * frame into the main view when you pick it.
 *
 * Uses GSAP's Flip plugin, which records the geometry of each element before a
 * DOM change and animates from the old position to the new one. That is what
 * lets a thumbnail travel into the main frame: React re-renders a completely
 * different node, and Flip matches the old and new nodes by `data-flip-id`.
 *
 * gsap was already a dependency here (unused since the scroll effects moved to
 * motion), and Flip ships inside it, so this adds no install weight.
 *
 * Rotation on the collapsed deck lives on an inner element with a plain CSS
 * transition: Flip drives the outer element's transform, so anything else that
 * writes to the same transform would be clobbered.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

// useLayoutEffect warns during SSR; the visual it prevents (a frame of
// un-animated layout) only exists in the browser anyway.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type FlipCardItem = {
  src: string;
  alt: string;
  /** small label above the title, e.g. the project type */
  category: string;
  title: string;
};

export function FlipCardStack({
  items,
  duration = 0.65,
  radius = 0,
  gap = 12,
  stackRotate = 4,
  className,
}: {
  items: FlipCardItem[];
  /** card transition duration, in seconds */
  duration?: number;
  /** rounded corners, in px */
  radius?: number;
  /** thumbnail spacing, in px */
  gap?: number;
  /** rotation per card while the deck is collapsed, in degrees */
  stackRotate?: number;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const [spread, setSpread] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const pending = useRef<ReturnType<typeof Flip.getState> | null>(null);

  const capture = () => {
    if (!root.current) return;
    pending.current = Flip.getState(root.current.querySelectorAll("[data-flip-id]"));
  };

  useIsoLayoutEffect(() => {
    if (!pending.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    Flip.from(pending.current, {
      duration: reduce ? 0 : duration,
      ease: "power3.inOut",
      absolute: true,
      nested: true,
    });
    pending.current = null;
  }, [active, spread, duration]);

  const current = items[active];
  const rest = items.map((item, i) => ({ item, i })).filter(({ i }) => i !== active);

  return (
    <div ref={root} className={className}>
      {/* main frame */}
      <button
        type="button"
        onClick={() => {
          capture();
          setSpread((s) => !s);
        }}
        aria-expanded={spread}
        aria-label={spread ? "Replier la pile de photos" : "Déplier la pile de photos"}
        className="group relative block w-full cursor-pointer overflow-hidden border border-border"
        style={{ borderRadius: `${radius}px` }}
      >
        <div className="aspect-[16/10] w-full">
          {current && (
            <img
              key={current.src}
              data-flip-id={current.src}
              src={current.src}
              alt={current.alt}
              loading="lazy"
              draggable={false}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-6 text-left text-background">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-background/70">
            {current?.category} · {String(active + 1).padStart(2, "0")}
          </p>
          <p className="mt-1 font-display text-xl font-bold lg:text-2xl">{current?.title}</p>
        </div>
      </button>

      {/* the deck: collapsed until clicked, then a row of frames */}
      <div
        className={`relative mt-5 ${spread ? "flex flex-wrap" : "h-24 lg:h-28"}`}
        style={spread ? { gap: `${gap}px` } : undefined}
      >
        {rest.map(({ item, i }, order) => (
          <button
            key={item.src}
            type="button"
            onClick={() => {
              capture();
              if (spread) setActive(i);
              else setSpread(true);
            }}
            aria-label={spread ? `Afficher ${item.title}` : "Déplier la pile de photos"}
            className={`overflow-hidden border border-border ${
              spread
                ? "relative h-24 w-32 cursor-pointer lg:h-28 lg:w-40"
                : "absolute top-0 h-24 w-32 cursor-pointer lg:h-28 lg:w-40"
            }`}
            style={{
              borderRadius: `${radius}px`,
              ...(spread ? {} : { left: `${order * 14}px`, zIndex: rest.length - order }),
            }}
          >
            {/* inner element owns the tilt so Flip keeps the outer transform */}
            <span
              className="block h-full w-full transition-transform duration-500"
              style={{ transform: spread ? "rotate(0deg)" : `rotate(${(order + 1) * stackRotate}deg)` }}
            >
              <img
                data-flip-id={item.src}
                src={item.src}
                alt={item.alt}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </span>
          </button>
        ))}

        {!spread && (
          <span className="pointer-events-none absolute left-0 top-full mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Cliquez pour déplier
          </span>
        )}
      </div>
    </div>
  );
}
