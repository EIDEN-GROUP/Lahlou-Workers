/**
 * Split canvas — a pinned panel where each image is cut away in horizontal
 * "blinds" as you scroll, revealing the next one underneath.
 *
 * The Hyperiux Vault original renders this with Three.js + a WebGL fragment
 * shader and wraps the whole app in Lenis smooth scroll. Both were a poor
 * trade here: ~160KB of dependencies for one homepage section, and root-level
 * Lenis would change the scroll feel of every page on the site. The two things
 * that actually carry the look — staggered slices and the pixel grid — are a
 * clip/transform and a repeating gradient, so this does it with `motion`
 * (already used by four other components here) and plain CSS.
 *
 * Layering: the last image sits at the bottom as the base, and each earlier
 * image stacks above it. A layer's slices slide out during its own transition
 * window, so whatever is beneath simply shows through — no crossfade.
 */
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";

// Fraction of each section's scroll spent holding still before the cut starts.
const HOLD = 0.55;
// Share of a transition given over to the per-slice stagger; the rest is the
// travel time of any single slice.
const STAGGER_SHARE = 0.45;

function Slice({
  progress,
  index,
  total,
  src,
  alt,
  start,
  end,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  src: string;
  alt: string;
  start: number;
  end: number;
}) {
  const span = end - start;
  const step = total > 1 ? (span * STAGGER_SHARE) / (total - 1) : 0;
  const from = start + index * step;
  const to = from + span * (1 - STAGGER_SHARE);

  const y = useTransform(progress, [from, to], ["0%", "-100%"], { clamp: true });

  const band = 100 / total;

  return (
    <div
      className="absolute inset-x-0 overflow-hidden"
      style={{ top: `${index * band}%`, height: `${band}%` }}
    >
      <motion.div className="absolute inset-0" style={{ y }}>
        {/* Blown up to the full panel and offset so this strip lines up with
            the slice it belongs to — together the slices rebuild the image. */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          draggable={false}
          className="absolute w-full object-cover"
          style={{ height: `${total * 100}%`, top: `-${index * 100}%` }}
        />
      </motion.div>
    </div>
  );
}

function Layer({
  progress,
  src,
  alt,
  numSlices,
  start,
  end,
  z,
}: {
  progress: MotionValue<number>;
  src: string;
  alt: string;
  numSlices: number;
  start: number;
  end: number;
  z: number;
}) {
  return (
    <div className="absolute inset-0" style={{ zIndex: z }}>
      {Array.from({ length: numSlices }, (_, s) => (
        <Slice
          key={s}
          progress={progress}
          index={s}
          total={numSlices}
          src={src}
          alt={alt}
          start={start}
          end={end}
        />
      ))}
    </div>
  );
}

function Copy({
  progress,
  index,
  total,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  children: ReactNode;
}) {
  const slot = 1 / total;
  const from = index * slot;
  const to = from + slot;
  // Fully readable through the middle of its own slot, gone by the next one.
  const opacity = useTransform(
    progress,
    [from, from + slot * 0.18, to - slot * 0.18, to],
    index === 0 ? [1, 1, 1, 0] : index === total - 1 ? [0, 1, 1, 1] : [0, 1, 1, 0],
    { clamp: true },
  );

  return (
    <motion.div className="absolute inset-0 flex items-center" style={{ opacity }}>
      {children}
    </motion.div>
  );
}

export function SplitCanvas<T>({
  sections,
  getImage,
  getAlt,
  renderContent,
  gridSize = 16,
  numSlices = 24,
  className,
}: {
  sections: T[];
  getImage: (section: T, index: number) => string;
  getAlt?: (section: T, index: number) => string;
  /** real DOM copy laid over the panel — keep the message here, not in the art */
  renderContent: (section: T, index: number) => ReactNode;
  /** pixel grid cell size, in px */
  gridSize?: number;
  /** horizontal slices per cut */
  numSlices?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const total = sections.length;
  const slot = 1 / total;
  // One cut per gap between images; reduced motion skips the animation and
  // just holds the first image, with all the copy still readable.
  const slices = reduce ? 1 : numSlices;

  return (
    <div ref={ref} className={`relative ${className ?? ""}`} style={{ height: `${total * 100}svh` }}>
      <div className="sticky top-0 flex h-svh w-full items-center overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 px-5 lg:flex-row lg:gap-12 lg:px-8">
          {/* the panel */}
          <div className="relative aspect-square w-full max-w-[min(72vw,420px)] shrink-0 overflow-hidden border border-border lg:max-w-[min(38vw,560px)]">
            {sections.map((section, i) => {
              // Last image is the base and never cuts away.
              if (i === total - 1) {
                return (
                  <img
                    key={i}
                    src={getImage(section, i)}
                    alt={getAlt?.(section, i) ?? ""}
                    loading="lazy"
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ zIndex: 1 }}
                  />
                );
              }
              return (
                <Layer
                  key={i}
                  progress={scrollYProgress}
                  src={getImage(section, i)}
                  alt={getAlt?.(section, i) ?? ""}
                  numSlices={slices}
                  start={(i + HOLD) * slot}
                  end={(i + 1) * slot}
                  z={total - i}
                />
              );
            })}

            {/* pixel grid — the part of the shader look that is just a gradient */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                zIndex: total + 1,
                backgroundImage: `repeating-linear-gradient(to right, rgba(0,0,0,0.13) 0 1px, transparent 1px ${gridSize}px), repeating-linear-gradient(to bottom, rgba(0,0,0,0.13) 0 1px, transparent 1px ${gridSize}px)`,
              }}
            />
          </div>

          {/* copy — real DOM, so it survives if the art never paints */}
          <div className="relative min-h-[16rem] w-full lg:min-h-[22rem] lg:flex-1">
            {sections.map((section, i) => (
              <Copy key={i} progress={scrollYProgress} index={i} total={total}>
                {renderContent(section, i)}
              </Copy>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
