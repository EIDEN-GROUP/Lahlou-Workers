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
import { motion } from "motion/react";
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
  /** optional chips under the description */
  tags?: string[];
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
      // The deck peels open card by card rather than every frame moving at
      // once, which is most of what makes the fan read as deliberate.
      stagger: reduce ? 0 : 0.05,
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
      // Fixed-width deck column so spreading the pile doesn't shove the copy
      // sideways; `auto` would resize as the deck changes shape.
      className={`grid items-center gap-10 lg:grid-cols-[120px_minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-12 ${className ?? ""}`}
    >
      {/* deck — a column beside the copy on desktop, a row above it on mobile */}
      <div
        className={`relative order-2 lg:order-1 ${
          spread
            ? "flex flex-row flex-wrap justify-center lg:flex-col lg:justify-start"
            : // sized to the pile itself: card + the offset of the last card
              "mx-auto h-[101px] w-[99px] lg:mx-0 lg:h-[119px] lg:w-[115px]"
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
            className={`group h-[86px] w-[72px] cursor-pointer overflow-hidden border border-border shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] transition-colors duration-300 hover:border-primary lg:h-[104px] lg:w-[88px] ${
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
              {/* hover lives on the image: the frame's transform belongs to
                  Flip and the tilt belongs to the span */}
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                draggable={false}
                className="h-full w-full scale-105 object-cover brightness-[0.88] saturate-[0.85] transition duration-500 group-hover:scale-100 group-hover:brightness-100 group-hover:saturate-100"
              />
            </span>
          </button>
        ))}
      </div>

      {/* copy */}
      <div className="relative order-3 lg:order-2">
        {/* oversized index sitting behind the title, same ghosted-number
            treatment the stacked project cards use */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-10 left-0 select-none font-display text-[120px] font-bold leading-none text-foreground/[0.04] lg:-top-16 lg:text-[180px]"
        >
          {String(active + 1).padStart(2, "0")}
        </span>

        {/* progress rail */}
        <div className="relative flex items-center gap-2">
          {items.map((item, i) => (
            <span
              key={item.src}
              className={`h-[3px] transition-all duration-500 ${
                i === active ? "w-8 bg-primary" : "w-3 bg-border"
              }`}
            />
          ))}
          <span className="ml-2 font-display text-xs font-bold tracking-tight text-muted-foreground">
            {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>
        </div>

        {/* keyed on `active` so each pick remounts and replays the entrance —
            without this the copy snapped between cards while the art animated */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="relative"
        >
          <p className="mt-7 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
            {current?.category}
            <span className="text-border">/</span>
            {current?.series}
          </p>
          <h3 className="mt-4 font-display text-[30px] font-bold leading-[1.05] lg:text-[46px]">
            {current?.title}
          </h3>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground lg:text-lg">
            {current?.description}
          </p>
          {current?.tags && current.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {current.tags.map((t) => (
                <span
                  key={t}
                  className="block border border-border bg-secondary px-4 py-2 text-xs font-semibold text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {!spread && (
          <button
            type="button"
            onClick={toggle}
            className="group/cta mt-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary"
          >
            <span className="h-px w-8 bg-primary transition-all duration-300 group-hover/cta:w-12" />
            Déplier la pile
          </button>
        )}
      </div>

      {/* main frame — capped, or the 4:5 box grows past the viewport on wide
          screens (a ~600px column would render ~750px tall) */}
      <div className="order-1 mx-auto w-full max-w-[340px] sm:max-w-[400px] lg:order-3 lg:mx-0 lg:max-w-[440px] lg:justify-self-end">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={spread}
          aria-label={spread ? "Replier la pile de photos" : "Déplier la pile de photos"}
          data-flip-id={current?.src}
          className="group/frame block aspect-[4/5] w-full cursor-pointer overflow-hidden border border-border shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]"
          style={{ borderRadius: `${radius}px` }}
        >
          {current && (
            // Motion drives the inner image; Flip owns the frame's transform,
            // so the two never write to the same element.
            <motion.img
              key={current.src}
              src={current.src}
              alt={current.alt}
              loading="lazy"
              draggable={false}
              initial={{ scale: 1.12, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full object-cover"
            />
          )}
        </button>
      </div>
    </div>
  );
}
