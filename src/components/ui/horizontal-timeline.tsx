/**
 * Horizontal timeline — milestones zigzag above and below a connector line
 * that draws itself as the section scrolls sideways.
 *
 * The Hyperiux Vault version drives this with GSAP ScrollTrigger + SplitText
 * and wraps the page in Lenis. This uses `motion` and CSS sticky instead:
 * every other scroll effect in this codebase already works that way, and
 * root-level Lenis would change how the whole site scrolls for one section.
 *
 * Below `lg` it renders a vertical timeline rather than a sideways one. The
 * vault's own notes list "horizontal layouts that break on small screens
 * without vertical alternates" as the usual way this component goes wrong —
 * its answer is an 800vw track on mobile, which is a long sideways drag on a
 * phone. The two layouts are swapped by media query rather than rendered both
 * and hidden with CSS, so the copy exists once in the DOM.
 */
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

// Milestone column width and side padding, in vw, for the sideways layout.
const CARD_VW = 26;
const PAD_VW = 12;

function useIsDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const read = () => setIsDesktop(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, [breakpoint]);
  return isDesktop;
}

function Milestone({
  progress,
  index,
  total,
  label,
  children,
  above,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  label: ReactNode;
  children: ReactNode;
  above: boolean;
}) {
  // Each milestone reveals just before the connector line reaches it.
  const at = total > 1 ? index / (total - 1) : 0;
  const from = Math.max(at - 0.12, 0);
  const opacity = useTransform(progress, [from, at], [0, 1], { clamp: true });
  const y = useTransform(progress, [from, at], [above ? 18 : -18, 0], { clamp: true });
  const dot = useTransform(progress, [from, at], [0, 1], { clamp: true });

  const card = (
    <motion.div style={{ opacity, y }} className="w-full max-w-[22vw]">
      <p className="font-display text-2xl font-bold leading-none lg:text-4xl">{label}</p>
      <div className="mt-4">{children}</div>
    </motion.div>
  );

  return (
    <div
      className="relative grid shrink-0 grid-rows-[1fr_auto_1fr] justify-items-center"
      style={{ width: `${CARD_VW}vw` }}
    >
      <div className="flex w-full items-end justify-center pb-8">{above ? card : null}</div>

      <div className="relative flex h-6 items-center justify-center">
        {/* stem from the line up or down to its card */}
        <motion.span
          aria-hidden
          style={{ opacity: dot }}
          className={`absolute left-1/2 h-8 w-px -translate-x-1/2 bg-border ${
            above ? "bottom-1/2" : "top-1/2"
          }`}
        />
        <motion.span
          aria-hidden
          style={{ scale: dot }}
          className="relative z-10 block h-3.5 w-3.5 rounded-full border-2 border-primary bg-background"
        />
      </div>

      <div className="flex w-full items-start justify-center pt-8">{above ? null : card}</div>
    </div>
  );
}

export function HorizontalTimeline<T>({
  items,
  getLabel,
  renderContent,
  className,
}: {
  items: T[];
  getLabel: (item: T, index: number) => ReactNode;
  renderContent: (item: T, index: number) => ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const isDesktop = useIsDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // How far the track has to travel for its last column to reach the viewport.
  const travel = Math.max(items.length * CARD_VW + PAD_VW * 2 - 100, 0);
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", `-${travel}vw`], { clamp: true });
  const lineScale = useTransform(scrollYProgress, [0, 0.98], [0, 1], { clamp: true });

  if (!isDesktop) {
    return (
      <div className={`relative mx-auto max-w-[1440px] px-5 ${className ?? ""}`}>
        <div className="absolute bottom-0 left-[22px] top-0 w-px bg-border" />
        <ol className="relative space-y-12 py-4">
          {items.map((item, i) => (
            <li key={i} className="relative pl-14">
              <span
                aria-hidden
                className="absolute left-[22px] top-1.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-primary bg-background"
              />
              <p className="font-display text-2xl font-bold leading-none">{getLabel(item, i)}</p>
              <div className="mt-3">{renderContent(item, i)}</div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`relative ${className ?? ""}`}
      style={{ height: `${100 + (reduce ? 0 : travel)}vh` }}
    >
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <motion.div
          className="relative flex w-max items-stretch"
          style={{ x: reduce ? "0vw" : x, paddingLeft: `${PAD_VW}vw`, paddingRight: `${PAD_VW}vw` }}
        >
          {/* connector line, drawn as the section scrolls */}
          <div
            aria-hidden
            className="absolute top-1/2 h-px bg-border"
            style={{ left: `${PAD_VW}vw`, right: `${PAD_VW}vw` }}
          />
          <motion.div
            aria-hidden
            className="absolute top-1/2 h-[2px] origin-left bg-primary"
            style={{
              left: `${PAD_VW}vw`,
              right: `${PAD_VW}vw`,
              scaleX: reduce ? 1 : lineScale,
            }}
          />

          {items.map((item, i) => (
            <Milestone
              key={i}
              progress={scrollYProgress}
              index={i}
              total={items.length}
              label={getLabel(item, i)}
              above={i % 2 === 0}
            >
              {renderContent(item, i)}
            </Milestone>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
