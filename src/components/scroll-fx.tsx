import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform, type Variants } from "motion/react";
import { useRef, useState, type ReactNode } from "react";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function FadeUp({ children, delay = 0, className, y = 28 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.8, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
};

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10% 0px -10% 0px" }}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return <motion.div className={className} variants={staggerItem}>{children}</motion.div>;
}

export function ScaleIn({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

export function LineReveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        initial={{ y: "115%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
        transition={{ duration: 0.9, ease: easeOut }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function ParallaxImage({ src, alt, className, imgClassName, strength = 60 }: { src: string; alt: string; className?: string; imgClassName?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);

  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <motion.img src={src} alt={alt} loading="lazy" width={1600} height={1200} style={{ y }} className={`h-full w-full scale-110 object-cover ${imgClassName ?? ""}`} />
    </div>
  );
}

export function HeroParallax({ src, alt }: { src: string; alt: string }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 160]);
  const scale = useTransform(scrollY, [0, 800], [1, 1.08]);

  return <motion.img src={src} alt={alt} width={1920} height={1200} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" style={{ y, scale }} />;
}

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  return <motion.div className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-primary" style={{ scaleX: scrollYProgress }} />;
}

// "Transform scroll position to any value" — a number that counts up as its
// own element crosses the viewport, driven directly by scroll progress (no timers).
export function ScrollCounter({ to, className, prefix = "", suffix = "" }: { to: number; className?: string; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.35"] });
  const rounded = useTransform(scrollYProgress, [0, 1], [0, to], { clamp: true });
  const [value, setValue] = useState(0);
  useMotionValueEvent(rounded, "change", v => setValue(Math.round(v)));

  return <span ref={ref} className={className}>{prefix}{value}{suffix}</span>;
}

// "Track element scroll position through viewport" — a rail that fills as the
// wrapped section itself travels from just-entering to just-leaving the viewport.
export function ScrollTrackedRail({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <div className="absolute inset-y-0 left-0 hidden w-px bg-current/15 lg:block" />
      <motion.div className="absolute inset-y-0 left-0 hidden w-px origin-top bg-primary lg:block" style={{ scaleY: scrollYProgress }} />
      {children}
    </div>
  );
}

// "Scroll image reveal effect" — the image wipes into view (clip-path) as it
// scrolls through, rather than just fading.
export function RevealImage({ src, alt, className, imgClassName }: { src: string; alt: string; className?: string; imgClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.35"] });
  const clip = useTransform(scrollYProgress, [0, 1], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

  return (
    <motion.div ref={ref} className={`overflow-hidden ${className ?? ""}`} style={{ clipPath: clip }}>
      <motion.img src={src} alt={alt} loading="lazy" width={1600} height={1200} style={{ scale }} className={`h-full w-full object-cover ${imgClassName ?? ""}`} />
    </motion.div>
  );
}

// "Circle reveal" (iris wipe), pinned — the section stays fixed in place while
// it collapses down into a contained circle (not all the way to a point) and
// then just holds there, pinned, at that size. Whatever comes next (e.g. the
// footer) is expected to be its own `position: sticky` sibling — that's what
// makes it slide up and physically cover this section as the user keeps
// scrolling, rather than anything being crossfaded or layered in here.
export function PinnedCircleReveal({ children, className, scrollVh = 160, stopAt = "26vmax" }: { children: ReactNode; className?: string; scrollVh?: number; stopAt?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 45, damping: 18, mass: 0.9 });
  const radius = useTransform(smoothProgress, [0.05, 0.55], ["150vmax", stopAt], { clamp: true });
  const clipPath = useTransform(radius, r => `circle(${r} at 50% 50%)`);

  return (
    <div ref={ref} className="relative" style={{ height: `${scrollVh}svh` }}>
      <motion.div className={`sticky top-0 ${className ?? ""}`} style={{ clipPath }}>
        {children}
      </motion.div>
    </div>
  );
}

// Pinned step-through — one sticky viewport where each step swaps in at the
// same position as you scroll, instead of each step taking its own scroll block.
// Sticky content wrapper — a pinned container that holds until every step has
// scrolled through; each step's text block triggers its paired image to
// scale up to full prominence while active, and scale back down (in a
// different direction depending on enter vs exit) as it passes — mirroring
// https://vault.hyperiux.com/demo/sticky-content-wrapper. The pin only
// releases once the last step has fully passed.
export function StickySteps<T>({ steps, renderImage, renderContent }: { steps: T[]; renderImage: (step: T, active: boolean) => ReactNode; renderContent: (step: T, active: boolean) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", v => {
    const idx = Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length)));
    setActive(idx);
  });

  return (
    <div ref={ref} className="relative" style={{ height: `${steps.length * 100}svh` }}>
      <div className="sticky top-0 h-svh overflow-hidden px-5 py-20 lg:px-8 lg:py-24">
        {/* Content is capped to exactly (100svh - vertical padding), so it can never exceed the sticky box no matter the viewport height. */}
        <div className="mx-auto grid h-[calc(100svh-10rem)] w-full max-w-[1440px] grid-rows-[3fr_2fr] items-stretch gap-6 lg:h-[calc(100svh-12rem)] lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-16">
          <div className="relative h-full min-h-0 overflow-hidden lg:col-span-6">
            {steps.map((s, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-all duration-300 ease-out"
                style={{
                  opacity: i === active ? 1 : 0,
                  transform: i === active ? "scale(1)" : i < active ? "scale(1.08)" : "scale(0.9)",
                }}
              >
                {renderImage(s, i === active)}
              </div>
            ))}
          </div>
          <div className="relative h-full min-h-0 border-l-2 border-border pl-8 lg:col-span-6">
            {steps.map((s, i) => (
              <div
                key={i}
                className="absolute inset-0 flex flex-col justify-center pl-8 transition-all duration-300 ease-out"
                style={{ opacity: i === active ? 1 : 0, transform: i === active ? "translateY(0)" : i < active ? "translateY(-24px)" : "translateY(24px)" }}
              >
                {renderContent(s, i === active)}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 justify-center gap-2 lg:bottom-10">
          {steps.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-8 bg-primary" : "w-1.5 bg-border"}`} />)}
        </div>
      </div>
    </div>
  );
}

// Stacking cards — a pinned viewport where full-bleed cards replace one
// another as you scroll: the active card sits at full scale, the outgoing
// card tilts back and shrinks away in 3D perspective, the incoming card
// zooms in from slightly smaller. Releases once the last card has passed.
// Mirrors https://vault.hyperiux.com/demo/stacking-cards.
export function StackingCards<T>({
  items,
  renderCard,
  imageZoomEnabled = true,
  tiltEnabled = true,
  cardCornerRadius = "3vw",
  stackPerspective = 1200,
  cardHeight = "72svh",
  className,
}: {
  items: T[];
  renderCard: (item: T, index: number, active: boolean) => ReactNode;
  imageZoomEnabled?: boolean;
  tiltEnabled?: boolean;
  cardCornerRadius?: string;
  stackPerspective?: number;
  cardHeight?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", v => {
    const idx = Math.min(items.length - 1, Math.max(0, Math.floor(v * items.length)));
    setActive(idx);
  });

  return (
    <div ref={ref} className={`relative ${className ?? ""}`} style={{ height: `${items.length * 100}svh` }}>
      <div className="sticky top-[10svh] overflow-hidden" style={{ height: cardHeight, perspective: `${stackPerspective}px` }}>
        {items.map((item, i) => {
          // Only the active card and the one just before it (still mid-flip-away) need to render —
          // everything else is either not reached yet or long gone.
          const isActive = i === active;
          const isLeaving = i === active - 1;
          if (!isActive && !isLeaving) return null;

          if (isLeaving) {
            // Was already mounted (it used to be the active card), so a plain CSS
            // transition can interpolate from its previous resting transform — the
            // top edge recedes back into the screen around a bottom pivot, staying
            // mostly in place, while the incoming card accumulates on top of it.
            return (
              <div
                key={i}
                className="absolute inset-0 overflow-hidden transition-[transform,opacity] duration-[900ms] ease-in-out"
                style={{
                  transform: tiltEnabled ? "translateY(-6%) scale(0.94) rotateX(50deg)" : "translateY(-100%) scale(0.96)",
                  // Finishes fully invisible — otherwise it lingers on screen, tilted, for
                  // the entire time the next card is active.
                  opacity: 0,
                  transitionDelay: "0ms, 550ms",
                  transformOrigin: "50% 100%",
                  borderRadius: cardCornerRadius,
                  zIndex: items.length + 1,
                }}
              >
                <div className={imageZoomEnabled ? "h-full w-full scale-110" : "h-full w-full"}>{renderCard(item, i, false)}</div>
              </div>
            );
          }

          // The active card mounts fresh each time it becomes active (it didn't exist
          // in the DOM the frame before), so a plain CSS transition has nothing to
          // interpolate from — it would just pop in. motion's initial/animate handles
          // the mount animation properly, sliding it up from below to "accumulate" over
          // the still-tilting previous card.
          return (
            <motion.div
              key={i}
              className="absolute inset-0 overflow-hidden"
              initial={{ y: "10%", scale: 0.94 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ borderRadius: 0, zIndex: items.length }}
            >
              <motion.div
                className="h-full w-full"
                initial={{ scale: imageZoomEnabled ? 1.1 : 1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              >
                {renderCard(item, i, true)}
              </motion.div>
            </motion.div>
          );
        })}
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 justify-center gap-2 lg:bottom-10">
          {items.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-8 bg-primary" : "w-1.5 bg-border"}`} />)}
        </div>
      </div>
    </div>
  );
}

// Horizontal feature reveal — a pinned full-viewport track where each item is
// its own full-width "chapter" panel; scrolling vertically drives the whole
// strip sideways one chapter at a time, with a dot rail tracking progress.
export function HorizontalFeatureReveal<T>({
  items,
  renderItem,
  className,
}: {
  items: T[];
  renderItem: (item: T, index: number, active: boolean) => ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(items.length - 1) * 100}%`]);
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", v => {
    const idx = Math.min(items.length - 1, Math.max(0, Math.round(v * (items.length - 1))));
    setActive(idx);
  });

  return (
    <div ref={ref} className={`relative ${className ?? ""}`} style={{ height: `${items.length * 100}svh` }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <motion.div className="flex h-full" style={{ x }}>
          {items.map((item, i) => (
            <div key={i} className="h-full w-full shrink-0">{renderItem(item, i, i === active)}</div>
          ))}
        </motion.div>
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2 lg:bottom-12">
          {items.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-8 bg-primary" : "w-1.5 bg-border"}`} />)}
        </div>
      </div>
    </div>
  );
}

// "Horizontal scroll section" — a pinned track that scrubs horizontally as the
// page scrolls vertically, instead of relying on manual drag/overflow.
export function HorizontalScrollSection({ children, className, trackClassName, distance = "-70%" }: { children: ReactNode; className?: string; trackClassName?: string; distance?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", distance]);

  return (
    <div ref={ref} className={`relative h-[280svh] ${className ?? ""}`}>
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <motion.div style={{ x }} className={`flex gap-4 ${trackClassName ?? ""}`}>{children}</motion.div>
      </div>
    </div>
  );
}

// Sticky scroll reveal — driven by the page's own scroll (no separate
// overflow box): a sticky visual panel stays pinned while text blocks pass
// by beside it as the page scrolls through the section's track. The active
// block is whichever breakpoint the section's scroll progress is closest to.
export function StickyScrollReveal<T>({
  items,
  renderContent,
  renderVisual,
  className,
}: {
  items: T[];
  renderContent: (item: T, index: number, active: boolean) => ReactNode;
  renderVisual: (item: T, index: number) => ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", latest => {
    const breakpoints = items.map((_, index) => index / items.length);
    const closest = breakpoints.reduce((acc, breakpoint, index) => {
      const distance = Math.abs(latest - breakpoint);
      return distance < Math.abs(latest - (breakpoints[acc] ?? 0)) ? index : acc;
    }, 0);
    setActive(closest);
  });

  return (
    <div ref={ref} className={`relative flex gap-10 ${className ?? ""}`} style={{ minHeight: `${items.length * 140}svh` }}>
      <div className="relative flex items-start px-4 lg:px-10">
        <div className="max-w-xl">
          {items.map((item, i) => (
            <div key={i} className="my-24 first:mt-0 last:mb-0" style={{ minHeight: "90svh" }}>
              {renderContent(item, i, i === active)}
            </div>
          ))}
        </div>
      </div>
      <div className="sticky top-24 hidden h-[70svh] aspect-[4/5] w-80 shrink-0 overflow-hidden self-start lg:block xl:w-96">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {items[active] !== undefined && renderVisual(items[active], active)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Scroll stack — each card is individually `position: sticky` with a slightly
// increasing top offset, so as you scroll, each new card piles on top of the
// previous one (CSS-only, no scroll-driven math — far more robust).
export function ScrollStack<T>({ items, renderItem, topOffset = 112, step = 20, className }: { items: T[]; renderItem: (item: T, index: number) => ReactNode; topOffset?: number; step?: number; className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {items.map((item, i) => (
        <div key={i} className="sticky" style={{ top: `${topOffset + i * step}px`, zIndex: i + 1 }}>
          {renderItem(item, i)}
        </div>
      ))}
    </div>
  );
}
