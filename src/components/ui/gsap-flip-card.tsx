/**
 * GSAP flip card — the Hyperiux Vault "gsap-flip-card" component, ported.
 *
 * Kept from the original: the Flip-measured stack -> hero + rail opening, the
 * swap that trades two cards without remounting them, the SplitText caption
 * reveal, keyboard nav, the reduced-motion path and the separate mobile
 * layout.
 *
 * Changed for this project:
 * - `next/image` (with `fill`) -> absolutely positioned `<img>`; this app is
 *   TanStack Start on Vite, not Next.
 * - `gsap/dist/*` -> `gsap/*` named imports, which is what resolves under Vite.
 * - Tailwind `z-60` / `aspect-4/5` -> bracketed equivalents.
 * - defaults recoloured to the site tokens instead of the vault's greys.
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(Flip, SplitText);

export interface GsapFlipCardItem {
  id?: string | number;
  image: string;
  alt?: string;
  caption?: string;
}

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

const CAPTION_LINE_VW = 1 * 1.3;
const CAPTION_MOBILE_LINE = `${3 * 1.5}vw`;
const CAPTION_MOBILE_LINE_SM = `${3.5 * 1.5}vw`;

/** `next/image` with `fill` — an absolutely positioned cover image. */
function Fill({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      loading="lazy"
      className="absolute inset-0 h-full w-full rounded-[inherit] object-cover"
    />
  );
}

export function GsapFlipCard({
  items,
  title = "",
  meta = "",
  description = "",
  backgroundColor = "#FAFAFA",
  textColor = "#0A0A0A",
  mutedColor = "#8F8F8F",
  rounded = 0,
  thumbWidth = 108,
  thumbHeight = 120,
  thumbGap = 12,
  heroWidth = 530,
  heroHeight = 670,
  duration = 0.7,
  ease = "power3.inOut",
  stackOffsetX = 3,
  stackOffsetY = 9,
  stackRotation = 0,
  showCounter = true,
  captionLines = 2,
  captionFadeDuration = 0.25,
  captionRevealDuration = 0.55,
  captionLineStagger = 0.07,
  onClose,
  className = "",
}: {
  items: GsapFlipCardItem[];
  title?: string;
  meta?: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
  mutedColor?: string;
  rounded?: number;
  thumbWidth?: number;
  thumbHeight?: number;
  thumbGap?: number;
  heroWidth?: number;
  heroHeight?: number;
  duration?: number;
  ease?: string;
  stackOffsetX?: number;
  stackOffsetY?: number;
  stackRotation?: number;
  showCounter?: boolean;
  captionLines?: number;
  captionFadeDuration?: number;
  captionRevealDuration?: number;
  captionLineStagger?: number;
  onClose?: () => void;
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();

  const [order, setOrder] = useState<number[]>(() => items.map((_, i) => i));
  const [opened, setOpened] = useState(false);
  const [stageWidth, setStageWidth] = useState(0);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());
  const flipStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const isAnimatingRef = useRef(false);

  const [shownCaption, setShownCaption] = useState<string | undefined>(() => items[0]?.caption);
  const captionRef = useRef<HTMLParagraphElement | null>(null);
  const captionTweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);
  const captionSplitRef = useRef<SplitText | null>(null);

  const revertCaptionSplit = useCallback(() => {
    captionSplitRef.current?.revert();
    captionSplitRef.current = null;
  }, []);

  useEffect(() => {
    setOrder(items.map((_, i) => i));
  }, [items]);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setStageWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const registerCard = useCallback((index: number, node: HTMLElement | null) => {
    if (node) cardRefs.current.set(index, node);
    else cardRefs.current.delete(index);
  }, []);

  const orderedCards = useCallback(
    () => order.map((i) => cardRefs.current.get(i)).filter(Boolean) as HTMLElement[],
    [order],
  );

  const isMobile = stageWidth > 0 && stageWidth <= 1025;
  const isNarrow = stageWidth > 0 && stageWidth < 900;
  const railCount = Math.max(items.length - 1, 0);
  const scale = isNarrow ? Math.min(1, stageWidth / 900) : 1;

  const tW = thumbWidth * scale;
  const tH = thumbHeight * scale;
  const gap = thumbGap * scale;
  const hW = Math.min(heroWidth * scale, stageWidth * 0.46);
  const hH = heroHeight * (hW / heroWidth || 1);
  const railX = Math.max(24, stageWidth * 0.045);
  const heroX = stageWidth - hW - railX;

  const stackWidth = Math.min(215 * scale, stageWidth * 0.42);
  const stackHeight = stackWidth * 1.5;

  const slotBox = useCallback(
    (slot: number) => {
      if (slot === 0) {
        return { x: heroX, y: 0, w: hW, h: hH, r: rounded * scale, z: items.length + 1 };
      }
      const railHeight = railCount * tH + (railCount - 1) * gap;
      const top = -railHeight / 2 + (slot - 1) * (tH + gap);
      return {
        x: railX,
        y: top + tH / 2,
        w: tW,
        h: tH,
        r: rounded * 0.6 * scale,
        z: items.length - slot,
      };
    },
    [heroX, hW, hH, railX, tW, tH, gap, railCount, rounded, scale, items.length],
  );

  const select = useCallback(
    (itemIndex: number) => {
      if (itemIndex === order[0] || isAnimatingRef.current) return;
      if (!isMobile) {
        flipStateRef.current = Flip.getState(orderedCards(), { props: "borderRadius" });
      }
      setOrder((prev) => {
        const next = [...prev];
        const from = next.indexOf(itemIndex);
        next[from] = next[0]!;
        next[0] = itemIndex;
        return next;
      });
    },
    [order, orderedCards, isMobile],
  );

  useLayoutEffect(() => {
    const state = flipStateRef.current;
    if (!state) return;
    flipStateRef.current = null;
    if (reducedMotion || isMobile) return;

    isAnimatingRef.current = true;
    Flip.from(state, {
      duration,
      ease,
      absolute: true,
      props: "borderRadius",
      onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration }),
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });
  }, [order, duration, ease, reducedMotion, isMobile]);

  const open = useCallback(() => {
    if (opened || isAnimatingRef.current || stageWidth === 0) return;

    if (reducedMotion) {
      setOpened(true);
      return;
    }

    const state = Flip.getState(orderedCards(), { props: "borderRadius" });
    setOpened(true);

    requestAnimationFrame(() => {
      isAnimatingRef.current = true;
      Flip.from(state, {
        duration,
        ease,
        absolute: true,
        props: "borderRadius",
        stagger: 0.04,
        onComplete: () => {
          isAnimatingRef.current = false;
        },
      });
    });
  }, [opened, stageWidth, reducedMotion, orderedCards, duration, ease]);

  const close = useCallback(() => {
    if (!opened || isAnimatingRef.current) return;

    if (reducedMotion) {
      setOpened(false);
      onClose?.();
      return;
    }

    const state = Flip.getState(orderedCards(), { props: "borderRadius" });
    setOpened(false);

    requestAnimationFrame(() => {
      isAnimatingRef.current = true;
      Flip.from(state, {
        duration: duration * 0.9,
        ease,
        absolute: true,
        props: "borderRadius",
        stagger: { each: 0.035, from: "end" },
        onComplete: () => {
          isAnimatingRef.current = false;
        },
      });
    });
    onClose?.();
  }, [opened, reducedMotion, orderedCards, duration, ease, onClose]);

  const nextCaption = items[order[0] ?? 0]?.caption;
  const activeCaption = reducedMotion ? nextCaption : shownCaption;

  useEffect(() => {
    if (reducedMotion || nextCaption === shownCaption) return;

    const el = captionRef.current;
    if (!el) {
      revertCaptionSplit();
      setShownCaption(nextCaption);
      return;
    }

    captionTweenRef.current?.kill();
    captionTweenRef.current = gsap.to(el, {
      opacity: 0,
      y: -8,
      duration: captionFadeDuration,
      ease: "power2.in",
      onComplete: () => {
        revertCaptionSplit();
        setShownCaption(nextCaption);
      },
    });
  }, [nextCaption, shownCaption, reducedMotion, captionFadeDuration, revertCaptionSplit]);

  useLayoutEffect(() => {
    const el = captionRef.current;
    if (!el || !activeCaption) return;

    if (reducedMotion) {
      revertCaptionSplit();
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    captionTweenRef.current?.kill();
    revertCaptionSplit();
    gsap.set(el, { opacity: 1, y: 0 });

    const split = SplitText.create(el, {
      type: "lines",
      linesClass: "hxs-caption-line",
      mask: "lines",
    });
    captionSplitRef.current = split;

    const lines = split.lines;
    if (!lines?.length) {
      revertCaptionSplit();
      return;
    }

    gsap.set(lines, { yPercent: 100 });
    captionTweenRef.current = gsap.to(lines, {
      yPercent: 0,
      duration: captionRevealDuration,
      stagger: captionLineStagger,
      ease: "power3.out",
    });

    return () => {
      captionTweenRef.current?.kill();
      revertCaptionSplit();
    };
  }, [activeCaption, reducedMotion, captionRevealDuration, captionLineStagger, revertCaptionSplit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (!opened || items.length < 2) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") select(order[1]!);
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") select(order[order.length - 1]!);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [order, select, close, opened, items.length]);

  if (items.length === 0) return null;

  const heroItemIndex = order[0] ?? 0;
  const heroItem = items[heroItemIndex];
  const heroSlotLabel = heroItemIndex + 1;

  const cardStyle = (itemIndex: number): CSSProperties => {
    const slot = order.indexOf(itemIndex);

    if (!opened) {
      return {
        position: "absolute",
        left: stageWidth / 2 - stackWidth / 2,
        top: "50%",
        width: stackWidth,
        height: stackHeight,
        borderRadius: rounded * 0.75 * scale,
        transform: `translateY(-50%) translate(${slot * stackOffsetX}px, ${slot * stackOffsetY}px) rotate(${slot * stackRotation}deg)`,
        zIndex: items.length - slot,
      };
    }

    const box = slotBox(slot);
    return {
      position: "absolute",
      left: box.x,
      top: "50%",
      width: box.w,
      height: box.h,
      borderRadius: box.r,
      transform: `translateY(calc(-50% + ${box.y}px))`,
      zIndex: box.z,
    };
  };

  const chromeStyle: CSSProperties = {
    opacity: opened ? 1 : 0,
    transition: "opacity 0.5s ease 0.25s",
    pointerEvents: opened ? undefined : "none",
  };

  if (isMobile) {
    return (
      <div
        ref={rootRef}
        className={`hxs-gsap-flip-card relative w-full overflow-hidden ${className}`}
        style={{ background: backgroundColor, color: textColor }}
      >
        <div className="flex flex-col gap-[6vw] px-[5vw] py-[8vw]">
          {showCounter && (
            <div className="text-[3vw] tracking-[0.02em]">
              <span className="font-semibold">{String(heroSlotLabel).padStart(2, "0")}</span>
              <span style={{ color: mutedColor }}> / {String(items.length).padStart(2, "0")}</span>
            </div>
          )}

          {heroItem && (
            <div
              className="relative min-h-[45svh] w-full flex-1 overflow-hidden bg-secondary shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)]"
              style={{ borderRadius: rounded }}
            >
              <Fill src={heroItem.image} alt={heroItem.alt ?? ""} />
            </div>
          )}

          <div className="max-[1025px]:pb-[3vh]">
            {title && (
              <h2 className="m-0 font-display text-[7vw] font-bold leading-[1.05] tracking-[-0.02em] max-md:text-[8.5vw]">
                {title}
              </h2>
            )}
            {meta && (
              <p className="mb-[4vw] mt-[3vw] text-[3vw] max-md:text-[3.5vw]" style={{ color: mutedColor }}>
                {meta}
              </p>
            )}
            {description && (
              <p className="m-0 text-[3.2vw] leading-[1.65] max-md:text-[3.8vw]">{description}</p>
            )}
            <div
              className="mt-[5vw] h-[calc(var(--hxs-cap-line)*var(--hxs-cap-lines))] max-md:[--hxs-cap-line:var(--hxs-cap-line-sm)]"
              style={
                {
                  "--hxs-cap-line": CAPTION_MOBILE_LINE,
                  "--hxs-cap-line-sm": CAPTION_MOBILE_LINE_SM,
                  "--hxs-cap-lines": captionLines,
                } as CSSProperties
              }
            >
              <p
                ref={captionRef}
                className="m-0 w-[80%] text-left text-[3vw] leading-normal max-md:w-[80%] max-md:text-left max-md:text-[4vw]"
              >
                {activeCaption}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-[3vw]">
            {order.slice(1).map((itemIndex) => {
              const item = items[itemIndex];
              if (!item) return null;
              return (
                <button
                  key={item.id ?? itemIndex}
                  type="button"
                  onClick={() => select(itemIndex)}
                  aria-label={item.alt ?? item.caption ?? `Image ${itemIndex + 1}`}
                  className="relative aspect-[4/5] w-full overflow-hidden border-none bg-secondary p-0 [-webkit-tap-highlight-color:transparent]"
                  style={{ borderRadius: rounded * 0.6 }}
                >
                  <Fill src={item.image} alt={item.alt ?? ""} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`hxs-gsap-flip-card relative min-h-svh w-full overflow-hidden ${className}`}
      style={{ background: backgroundColor, color: textColor }}
    >
      {showCounter && (
        <div
          className="absolute left-[2.78vw] top-[2.22vw] z-[60] text-[0.9vw] tracking-[0.02em]"
          style={chromeStyle}
        >
          <span className="font-semibold">{String(heroSlotLabel).padStart(2, "0")}</span>
          <span style={{ color: mutedColor }}> / {String(items.length).padStart(2, "0")}</span>
        </div>
      )}

      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className={`relative min-h-svh w-full ${opened ? "cursor-pointer" : "cursor-default"}`}
      >
        <div
          className={`pointer-events-none absolute top-1/2 z-30 max-w-[22.22vw] -translate-y-1/2 ${
            isNarrow ? "hidden" : "block"
          }`}
          style={{ ...chromeStyle, left: railX + tW + Math.max(48, stageWidth * 0.06) }}
        >
          {title && (
            <h2 className="m-0 font-display text-[3.2vw] font-bold leading-[1.05] tracking-[-0.02em]">
              {title}
            </h2>
          )}
          {meta && (
            <p className="mx-0 mb-[1.81vw] mt-[0.97vw] text-[0.9vw]" style={{ color: mutedColor }}>
              {meta}
            </p>
          )}
          {description && <p className="m-0 text-[0.97vw] leading-[1.65]">{description}</p>}
          <div className="mt-[1.94vw]" style={{ height: `${CAPTION_LINE_VW * captionLines}vw` }}>
            <p ref={captionRef} className="m-0 w-[80%] text-left text-[1vw] leading-[1.3]">
              {activeCaption}
            </p>
          </div>
        </div>

        {items.map((item, itemIndex) => {
          const isHero = itemIndex === heroItemIndex;
          return (
            <button
              key={item.id ?? itemIndex}
              type="button"
              ref={(n) => registerCard(itemIndex, n)}
              data-flip-id={`hxs-card-${item.id ?? itemIndex}`}
              onClick={() => (opened ? select(itemIndex) : open())}
              aria-label={
                opened
                  ? (item.alt ?? item.caption ?? `Image ${itemIndex + 1}`)
                  : `Ouvrir la galerie — ${items.length} images`
              }
              aria-current={(opened && isHero) || undefined}
              tabIndex={!opened ? (itemIndex === order[0] ? 0 : -1) : isHero ? -1 : 0}
              className={`overflow-hidden border-none bg-secondary p-0 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)] [-webkit-tap-highlight-color:transparent] ${
                !opened || !isHero ? "cursor-pointer" : "cursor-default"
              }`}
              style={cardStyle(itemIndex)}
            >
              <Fill src={item.image} alt={item.alt ?? ""} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default GsapFlipCard;
