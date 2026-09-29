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
  /** left-hand label in the meta line, e.g. the project type */
  category: string;
  /** right-hand label in the meta line, e.g. the series */
  series: string;
  title: string;
  description: string;
};

export function FlipCardStack({
  items,
  duration = 0.65,
  radius = 0,
  gap = 10,
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

  const toggle = () => {
    capture();
    setSpread((s) => !s);
  };

  return (
    <div
      ref={root}
      className={`grid items-center gap-10 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 ${className ?? ""}`}
    >
      {/* deck — a column beside the copy on desktop, a row above it on mobile */}
      <div
        className={`relative order-2 lg:order-1 ${
          spread
            ? "flex flex-row flex-wrap lg:flex-col"
            : "h-[86px] w-full lg:h-[300px] lg:w-[104px]"
        }`}
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
            aria-label={spread ? `Afficher : ${item.title}` : "Déplier la pile de photos"}
            data-flip-id={item.src}
            className={`h-[86px] w-[72px] cursor-pointer overflow-hidden border border-border lg:h-[104px] lg:w-[88px] ${
              spread ? "relative" : "absolute"
            }`}
            style={{
              borderRadius: `${radius}px`,
              // Offset via left/top, not transform: Flip drives transform, and
              // an inline one here would be fighting it every frame.
              ...(spread
                ? {}
                : { zIndex: rest.length - order, left: order * 9, top: order * 5 }),
            }}
          >
            {/* inner element owns the tilt so Flip keeps the outer transform */}
            <span
              className="block h-full w-full transition-transform duration-500"
              style={{
                transform: spread ? "rotate(0deg)" : `rotate(${(order + 1) * stackRotate}deg)`,
              }}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </span>
          </button>
        ))}
      </div>

      {/* copy */}
      <div className="order-3 lg:order-2">
        <p className="font-display text-sm font-bold tracking-tight">
          {String(active + 1).padStart(2, "0")}
          <span className="text-muted-foreground"> / {String(items.length).padStart(2, "0")}</span>
        </p>
        <h3 className="mt-6 font-display text-[32px] font-bold leading-[1.05] lg:text-[52px]">
          {current?.title}
        </h3>
        <p className="mt-6 text-sm text-muted-foreground">
          {current?.category} / {current?.series} / {String(active + 1).padStart(2, "0")}
        </p>
        <p className="mt-5 max-w-md text-base leading-relaxed lg:text-lg">{current?.description}</p>
        {!spread && (
          <button
            type="button"
            onClick={toggle}
            className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-primary underline-offset-4 hover:underline"
          >
            Déplier la pile
          </button>
        )}
      </div>

      {/* main frame */}
      <div className="order-1 lg:order-3">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={spread}
          aria-label={spread ? "Replier la pile de photos" : "Déplier la pile de photos"}
          data-flip-id={current?.src}
          className="block aspect-[4/5] w-full cursor-pointer overflow-hidden border border-border"
          style={{ borderRadius: `${radius}px` }}
        >
          {current && (
            <img
              key={current.src}
              src={current.src}
              alt={current.alt}
              loading="lazy"
              draggable={false}
              className="h-full w-full object-cover"
            />
          )}
        </button>
      </div>
    </div>
  );
}
