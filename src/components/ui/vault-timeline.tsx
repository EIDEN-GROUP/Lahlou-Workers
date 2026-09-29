/**
 * Vault timeline — the Hyperiux Vault "timeline" component, ported.
 *
 * Kept from the original: the GSAP ScrollTrigger scrub, the SplitText line
 * reveals, the zigzag of milestones above and below a line that draws itself,
 * and the reduced-motion path that jumps straight to the final state.
 *
 * Changed for this project:
 * - `next/image` -> `<img>`; this app is TanStack Start on Vite, not Next.
 * - no `<ReactLenis root>`. lenis isn't a dependency here, and wrapping the
 *   root would change the scroll feel of every page on the site to ship one
 *   section. Lenis only adds easing; the scrub works without it.
 * - the original hardcodes its milestones as module constants and its
 *   scroll positions as 7-entry arrays, so `<Timeline />` renders a fixed
 *   demo story and anything other than 7 items reads `positions[i]` as
 *   undefined and throws on destructure. Both are derived from `items` here.
 *
 * The vw-based sizing was authored around 4 top + 3 bottom milestones. The
 * track width and travel are scaled from the real counts, but this is the part
 * most worth eyeballing if the spacing looks off.
 */
import { type CSSProperties, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText);

export type VaultTimelineItem = {
  id: string;
  /** headline for the milestone */
  label: string;
  /** supporting line under it */
  content: string;
  /** optional artwork shown inside the milestone card */
  image?: string;
};

type SplitTextInstance = InstanceType<typeof SplitText>;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => (typeof window === "undefined" ? false : (window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false)),
    () => false,
  );
}

/** Reveal windows, spread evenly instead of the original's fixed 7 entries. */
function buildPositions(count: number, first: number, last: number, span: number) {
  if (count <= 1) return [[first, first + span] as const];
  const step = (last - first) / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const start = first + i * step;
    return [start, start + span] as const;
  });
}

export function VaultTimeline({
  items,
  title = "Étapes",
  periodLabel,
  textColor = "#0A0A0A",
  mutedTextColor = "#8F8F8F",
  activeColor = "#C4291E",
  backgroundColor = "#FAFAFA",
  imageUrl,
  imageAlt = "",
  scrollDuration = 1.2,
}: {
  items: VaultTimelineItem[];
  title?: string;
  periodLabel?: string;
  textColor?: string;
  mutedTextColor?: string;
  activeColor?: string;
  backgroundColor?: string;
  imageUrl?: string;
  imageAlt?: string;
  scrollDuration?: number;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const normalizedDuration = Math.max(0.2, scrollDuration);

  // Alternate into the two rows, preserving order along the line.
  const top = items.filter((_, i) => i % 2 === 0);
  const bottom = items.filter((_, i) => i % 2 === 1);
  const widest = Math.max(top.length, bottom.length);

  // Original: 240vw of track for 4 top milestones at 45vw apart.
  const trackVw = 60 + widest * 45 + 20;
  const slidePercentDesktop = -Math.min(((trackVw - 100) / trackVw) * 100, 80);

  const sectionStyle = { color: textColor, backgroundColor } satisfies CSSProperties;
  const activeStyle = { backgroundColor: activeColor } satisfies CSSProperties;
  const mutedTextStyle = { color: mutedTextColor } satisfies CSSProperties;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const isTablet = window.innerWidth >= 642 && window.innerWidth <= 1024;
      const isMobile = window.innerWidth < 642;
      const slidePercent = isTablet ? -60 : isMobile ? -57 : slidePercentDesktop;
      const lineWidth = isTablet ? "75%" : isMobile ? "65%" : "98%";
      const lineStart = isTablet ? "top 20%" : isMobile ? "top 30%" : "top 25%";
      const slideEnd = isMobile ? "82% 50%" : "92% bottom";
      const lineEnd = isMobile ? "80% 50%" : isTablet ? "90% bottom" : "92% bottom";

      gsap
        .timeline({
          scrollTrigger: { trigger: section, start: "2% top", end: slideEnd, scrub: true },
          defaults: { ease: "none" },
        })
        .fromTo(wholeSliderRef.current, { xPercent: 0 }, { xPercent: slidePercent });

      if (reducedMotion) {
        gsap.set(".journey-line", { width: lineWidth });
        return;
      }

      gsap.to(".journey-line", {
        width: lineWidth,
        ease: "none",
        scrollTrigger: { trigger: section, start: lineStart, end: lineEnd, scrub: true },
      });
    },
    { dependencies: [reducedMotion, slidePercentDesktop], scope: sectionRef },
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      if (reducedMotion) {
        items.forEach((item) => {
          gsap.set(`.jl-${item.id}`, { scaleY: 1 });
          gsap.set(`.jd-${item.id}`, { scale: 1 });
          gsap.set(`.title-${item.id}`, { opacity: 1, clearProps: "transform" });
          gsap.set(`.description-${item.id}`, { opacity: 1, clearProps: "transform" });
        });
        return;
      }

      items.forEach((item) => {
        gsap.set(`.jl-${item.id}`, { scaleY: 0, transformOrigin: "bottom bottom" });
        gsap.set(`.jd-${item.id}`, { scale: 0 });
        gsap.set(`.title-${item.id}`, { opacity: 1 });
        gsap.set(`.description-${item.id}`, { opacity: 1 });
      });

      const titleSplits: Partial<Record<string, SplitTextInstance>> = {};
      const descriptionSplits: Partial<Record<string, SplitTextInstance>> = {};
      items.forEach((item) => {
        titleSplits[item.id] = new SplitText(`.title-${item.id}`, {
          type: "chars, words, lines",
          mask: "lines",
        });
        descriptionSplits[item.id] = new SplitText(`.description-${item.id}`, {
          type: "chars, words, lines",
          mask: "lines",
        });
      });

      const isMobile = window.innerWidth < 642;
      const isTablet = window.innerWidth >= 642 && window.innerWidth <= 1024;
      const positions = isMobile
        ? buildPositions(items.length, 22, 69, 10)
        : isTablet
          ? buildPositions(items.length, 16, 70, 12)
          : buildPositions(items.length, 6, 65, 20);

      items.forEach((item, index) => {
        const range = positions[index];
        if (!range) return;
        const [startPos, endPos] = range;
        const isTop = index % 2 === 0;
        if (!isTop) gsap.set(`.jl-${item.id}`, { transformOrigin: "top top" });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: `${startPos}% 38%`,
              end: `${endPos}% 50%`,
              scrub: true,
            },
          })
          .to(`.jl-${item.id}`, { scaleY: 1, duration: normalizedDuration * 0.4 })
          .to(`.jd-${item.id}`, { scale: 1, duration: normalizedDuration * 0.4 }, "<")
          .fromTo(
            titleSplits[item.id]?.lines ?? [],
            { y: 100 },
            {
              y: 0,
              delay: -0.8 * normalizedDuration,
              duration: normalizedDuration,
              stagger: 0.02,
              ease: "power2.out",
            },
          )
          .fromTo(
            descriptionSplits[item.id]?.lines ?? [],
            { y: 100 },
            { y: 0, duration: normalizedDuration, stagger: 0.02, ease: "power2.out" },
            "<",
          );
      });

      const handleResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", handleResize);
      return () => {
        Object.values(titleSplits).forEach((s) => s?.revert?.());
        Object.values(descriptionSplits).forEach((s) => s?.revert?.());
        window.removeEventListener("resize", handleResize);
      };
    },
    { dependencies: [normalizedDuration, reducedMotion, items], scope: sectionRef },
  );

  const milestone = (item: VaultTimelineItem, isTop: boolean) => (
    <div
      key={item.id}
      className={
        isTop
          ? "relative h-full w-[30vw] px-[3vw] max-[1025px]:w-[50vw] max-[1025px]:px-[5vw] max-md:flex max-md:w-[70vw] max-md:flex-col max-md:px-[7vw]"
          : "relative h-full w-[25vw] px-[3vw] max-[1025px]:flex max-[1025px]:w-[20%] max-[1025px]:flex-col max-[1025px]:justify-center max-[1025px]:px-[5vw] max-md:w-[70vw] max-md:px-[7vw]"
      }
    >
      <div className={`absolute left-0 w-full ${isTop ? "bottom-0 top-0 h-full" : "bottom-[-1%] h-full"}`}>
        {isTop ? (
          <>
            <div
              className={`relative aspect-square size-[1vw] translate-x-[-50%] rounded-full max-[1025px]:size-[2vw] max-md:size-[2.5vw] jd-${item.id}`}
              style={activeStyle}
            />
            <div
              className={`h-[94%] w-px origin-bottom rounded-full jl-${item.id}`}
              style={activeStyle}
            />
          </>
        ) : (
          <>
            <div
              className={`h-[94%] w-px origin-top rounded-full max-md:h-full jl-${item.id}`}
              style={activeStyle}
            />
            <div
              className={`relative aspect-square w-auto size-[1vw] translate-x-[-50%] rounded-full max-[1025px]:size-[2vw] max-md:size-[2.5vw] jd-${item.id}`}
              style={activeStyle}
            />
          </>
        )}
      </div>
      <div
        className={
          isTop
            ? "mt-[-1vw] space-y-[1vw] max-[1025px]:mt-[-1.5vw] max-md:mt-[-2vw]"
            : "flex h-full w-full flex-col justify-end space-y-[1vw]"
        }
      >
        {item.image && (
          <div
            className="w-full overflow-hidden border h-[9vw] max-[1025px]:h-[18vw] max-md:h-[26vw]"
            style={{ borderColor: `${mutedTextColor}33` }}
          >
            <img
              src={item.image}
              alt=""
              aria-hidden
              loading="lazy"
              className="h-full w-full object-contain p-[1vw] max-md:p-[3vw]"
            />
          </div>
        )}
        <h4
          className={`title-${item.id} font-display text-[2.5vw] font-bold leading-none max-[1025px]:text-[5vw] max-md:text-[6.4vw]`}
        >
          {item.label}
        </h4>
        <p
          className={`description-${item.id} w-[90%] text-[1.5vw] leading-[1.15] max-[1025px]:w-[70%] max-[1025px]:text-[3.2vw] max-md:w-[90%] max-md:text-[4.8vw]`}
          style={mutedTextStyle}
        >
          {item.content}
        </p>
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      // The original pads this 7% top and bottom, which on a wide screen is
      // ~100px of empty band either side of a section that is already mostly
      // empty scroll runway.
      className="relative h-[200vw] w-full max-[1025px]:h-[400vh] max-md:h-[400vh]"
      style={sectionStyle}
    >
      {/* Original: `top-[10%] h-screen w-screen pt-[5%]`. The track is only
          30vw tall, so pinning it to the top of a full-height box left a large
          dead band underneath it — centre it instead. `w-screen` also counts
          the scrollbar, which overflows the page horizontally. */}
      <div className="sticky top-0 flex h-svh w-full items-center overflow-hidden">
        <div
          ref={wholeSliderRef}
          // Taller than the original's 30vw: each milestone now carries its
          // own artwork above the title, which the original had no room for.
          className="mr-[2vw] flex h-[44vw] items-center gap-[5vw] px-[5vw] max-[1025px]:h-[70vh] max-[1025px]:w-[400vw] max-[1025px]:flex-col max-[1025px]:items-start max-[1025px]:gap-[2vw] max-[1025px]:px-[5vw] max-md:h-[80vh] max-md:w-[800vw] max-md:px-[7vw]"
          style={{ width: `${trackVw}vw` }}
        >
          {imageUrl && (
            <div className="h-full w-[30vw] overflow-hidden rounded-[1vw] max-[1025px]:h-[40vw] max-[1025px]:w-[15%] max-[1025px]:rounded-[3vw] max-md:h-[65vw] max-md:w-[85vw] max-md:rounded-[5vw]">
              <img
                src={imageUrl}
                alt={imageAlt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="relative h-full w-full max-[1025px]:h-[50%]">
            <div className="tranlate-y-[-50%] absolute left-0 top-[49%] flex h-fit w-full items-center">
              <div
                className="h-[.8vw] w-[.8vw] rounded-full max-[1025px]:h-[1.5vw] max-[1025px]:w-[1.5vw] max-md:h-[2vw] max-md:w-[2vw]"
                style={activeStyle}
              />
              <div className="journey-line h-px w-[0%] rounded-full" style={activeStyle} />
              <div
                className="h-[.8vw] w-[.8vw] rounded-full max-[1025px]:h-[1.5vw] max-[1025px]:w-[1.5vw] max-md:h-[2vw] max-md:w-[2vw]"
                style={activeStyle}
              />
            </div>

            <div className="flex h-1/2 w-full items-center justify-start gap-[.5vw]">
              <div className="h-full w-[20%] pt-[2vw] max-md:h-fit max-md:pt-[5vw]">
                <h2 className="w-[65%] font-display text-[3vw] font-bold leading-[0.95] max-[1025px]:w-[75%] max-[1025px]:text-[7vw] max-md:text-[8.5vw]">
                  {title}
                </h2>
              </div>
              <div className="flex h-full w-full gap-x-[15vw] max-md:gap-x-[40vw]">
                {top.map((item) => milestone(item, true))}
              </div>
            </div>

            <div className="flex h-1/2 w-full items-center justify-start">
              <div className="h-full w-[34%] pt-[2vw] max-[1025px]:pt-[5vw] max-md:w-[30%] max-md:pt-[5vw]">
                {periodLabel && (
                  <p
                    className="text-[1.65vw] leading-none max-[1025px]:text-[3vw] max-md:text-[4.2vw]"
                    style={mutedTextStyle}
                  >
                    {periodLabel}
                  </p>
                )}
              </div>
              <div className="ml-[7vw] flex h-full w-full gap-x-[20vw] max-[1025px]:ml-0 max-md:ml-[7vw] max-md:gap-x-[40vw]">
                {bottom.map((item) => milestone(item, false))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
