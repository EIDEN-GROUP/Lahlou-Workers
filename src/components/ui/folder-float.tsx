import Matter from "matter-js";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import "./folder-float.css";

const { Bodies, Body, Composite, Engine } = Matter;

type FolderFloatItem = string | { label: string; value: string };

const PAD = 28;
const CHAR = 6.8;
const GAP = 12;
const ROW = 52;
const DRAG_MIN = 4;
const ZONE_PAD = 8;

const jitter = (i: number) => {
  const x = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;
  return x - Math.floor(x);
};

const layout = (list: { label: string; value: string }[], spread: number, lift: number, tilt: number, sizes: { w: number; h: number }[]) => {
  const rows: { items: { i: number; pw: number }[]; width: number }[] = [];
  let row: { i: number; pw: number }[] = [];
  let width = 0;
  list.forEach((item, i) => {
    const pw = sizes[i]?.w ?? PAD + item.label.length * CHAR;
    if (row.length && width + GAP + pw > spread * 2) {
      rows.push({ items: row, width });
      row = [];
      width = 0;
    }
    row.push({ i, pw });
    width += (row.length > 1 ? GAP : 0) + pw;
  });
  if (row.length) rows.push({ items: row, width });
  const pos: { x: number; y: number; r: number }[] = [];
  rows.forEach((r, ri) => {
    let x = -r.width / 2;
    const shift = (ri % 2 ? 1 : -1) * Math.min(16, spread * 0.1);
    r.items.forEach(({ i, pw }) => {
      const j = jitter(i);
      pos[i] = { x: x + pw / 2 + shift + (j - 0.5) * 6, y: -lift - ri * ROW - j * 6, r: tilt * (j * 2 - 1) };
      x += pw + GAP;
    });
  });
  return pos;
};

export function FolderFloat({
  items,
  label = "Filtrer",
  sublabel = "",
  trigger = "hover",
  defaultOpen = false,
  closeOnSelect = true,
  physics = true,
  drift = 0.5,
  onSelect,
  onOpenChange,
  folderColor = "#141414",
  frontColor = "#1f1f1f",
  paperColor = "#F9F9F9",
  itemColor = "#F9F9F9",
  itemTextColor = "#0A0A0A",
  labelColor = "#F9F9F9",
  width = 200,
  height = 148,
  radius = 0,
  spread = 180,
  lift = 26,
  tilt = 8,
  flapAngle = 34,
  restAngle = 16,
  openDuration = 520,
  stagger = 45,
  bounce = 0.3,
  className = "",
}: {
  items: FolderFloatItem[];
  label?: string;
  sublabel?: string;
  trigger?: "hover" | "click";
  defaultOpen?: boolean;
  closeOnSelect?: boolean;
  physics?: boolean;
  drift?: number;
  onSelect?: (value: string, index: number) => void;
  onOpenChange?: (open: boolean) => void;
  folderColor?: string;
  frontColor?: string;
  paperColor?: string;
  itemColor?: string;
  itemTextColor?: string;
  labelColor?: string;
  width?: number;
  height?: number;
  radius?: number;
  spread?: number;
  lift?: number;
  tilt?: number;
  flapAngle?: number;
  restAngle?: number;
  openDuration?: number;
  stagger?: number;
  bounce?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [popped, setPopped] = useState(-1);
  const [live, setLive] = useState(false);
  const [sizes, setSizes] = useState<{ w: number; h: number }[]>([]);
  // The pills spread ±spread px from the folder's anchor point, which sits near the
  // left edge of the page on mobile — an unclamped spread pushes pills off both
  // sides of a narrow viewport, so it's capped relative to window width.
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1280));
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const effectiveSpread = Math.min(spread, Math.max(90, viewportWidth * 0.42));
  // On a short/narrow phone screen the pills floating upward by `lift` can climb
  // straight into whatever heading sits above the widget — shrink the float height
  // (and the row spacing that stacks on top of it) well below the desktop default.
  const effectiveLift = viewportWidth < 640 ? Math.min(lift, 14) : viewportWidth < 1280 ? Math.min(lift, 20) : lift;
  const anchorRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const world = useRef<{
    engine: Matter.Engine | null;
    bodies: Matter.Body[];
    sizes: { w: number; h: number }[];
    raf: number;
    last: number;
    t0: number;
    drag: { i: number; id: number; dx: number; dy: number; sx: number; sy: number; moved: boolean } | null;
    zone: { left: number; right: number; top: number; bottom: number } | null;
    live: boolean;
  }>({ engine: null, bodies: [], sizes: [], raf: 0, last: 0, t0: 0, drag: null, zone: null, live: false });
  const latest = useRef({ onSelect, onOpenChange, drift, reduce: false });
  latest.current = { onSelect, onOpenChange, drift, reduce: latest.current.reduce };
  const popTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const liveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const list = items.map(item => (typeof item === "string" ? { label: item, value: item } : item));
  const n = list.length;
  const sub = sublabel || `${n} ${n === 1 ? "métier" : "métiers"}`;
  const pos = layout(list, effectiveSpread, effectiveLift, tilt, sizes);

  const labelsKey = list.map(item => item.label).join("|");
  useLayoutEffect(() => {
    const measure = () => {
      const next = pillRefs.current.slice(0, n).map(el => (el ? { w: el.offsetWidth, h: el.offsetHeight } : null));
      if (next.some(s => !s)) return;
      setSizes(prev =>
        prev.length === next.length && prev.every((s, i) => s.w === next[i]!.w && s.h === next[i]!.h) ? prev : (next as { w: number; h: number }[]),
      );
    };
    measure();
    document.fonts?.ready.then(measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, labelsKey]);

  const stopPhysics = useCallback(() => {
    const w = world.current;
    clearTimeout(liveTimer.current);
    cancelAnimationFrame(w.raf);
    w.raf = 0;
    if (w.engine) {
      w.bodies.forEach((b, i) => {
        const el = pillRefs.current[i];
        if (!el) return;
        el.style.setProperty("--x", `${b.position.x.toFixed(1)}px`);
        el.style.setProperty("--y", `${(b.position.y - w.sizes[i]!.h / 2).toFixed(1)}px`);
      });
      Composite.clear(w.engine.world, false, true);
      Engine.clear(w.engine);
      w.engine = null;
    }
    w.bodies = [];
    w.drag = null;
    w.live = false;
    setLive(false);
  }, []);

  const startPhysics = useCallback(() => {
    const w = world.current;
    if (w.engine) return;
    const els = pillRefs.current.slice(0, n);
    if (els.some(el => !el)) return;
    const engine = Engine.create({ gravity: { x: 0, y: 0 } });
    engine.enableSleeping = false;
    w.engine = engine;
    w.sizes = els.map(el => ({ w: el!.offsetWidth, h: el!.offsetHeight }));
    const ys = pos.map(p => p.y);
    const zone = {
      left: -effectiveSpread - ZONE_PAD,
      right: effectiveSpread + ZONE_PAD,
      top: Math.min(...ys) - ZONE_PAD,
      bottom: -effectiveLift + Math.max(...w.sizes.map(s => s.h)),
    };
    w.zone = zone;
    w.bodies = els.map((el, i) => {
      const { w: bw, h: bh } = w.sizes[i]!;
      const b = Bodies.rectangle(pos[i]!.x, pos[i]!.y + bh / 2, bw, bh, {
        chamfer: { radius: Math.min(bh / 2 - 1, 16) },
        restitution: 0.55,
        friction: 0,
        frictionAir: 0.08,
        inertia: Infinity,
      });
      (b.plugin as { phase: number }).phase = jitter(i) * Math.PI * 2;
      return b;
    });
    const T = 80;
    const walls = [
      Bodies.rectangle((zone.left + zone.right) / 2, zone.top - T / 2, zone.right - zone.left + 2 * T, T, { isStatic: true }),
      Bodies.rectangle((zone.left + zone.right) / 2, zone.bottom + T / 2, zone.right - zone.left + 2 * T, T, { isStatic: true }),
      Bodies.rectangle(zone.left - T / 2, (zone.top + zone.bottom) / 2, T, zone.bottom - zone.top + 2 * T, { isStatic: true }),
      Bodies.rectangle(zone.right + T / 2, (zone.top + zone.bottom) / 2, T, zone.bottom - zone.top + 2 * T, { isStatic: true }),
    ];
    Composite.add(engine.world, [...w.bodies, ...walls]);
    w.live = true;
    w.last = 0;
    w.t0 = performance.now();
    setLive(true);
    const tick = (now: number) => {
      const s = world.current;
      if (!s.engine) return;
      const dt = s.last ? Math.min(32, now - s.last) : 16;
      s.last = now;
      const t = (now - s.t0) / 1000;
      const k = latest.current.drift * 0.00005 * Math.min(1, t / 2);
      s.bodies.forEach((b, i) => {
        if (s.drag && s.drag.i === i) return;
        const ph = (b.plugin as { phase: number }).phase;
        Body.applyForce(b, b.position, {
          x: Math.sin(t * 0.9 + ph) * k * b.mass,
          y: Math.cos(t * 1.3 + ph * 1.7) * k * b.mass,
        });
      });
      Engine.update(s.engine, dt);
      s.bodies.forEach((b, i) => {
        const el = pillRefs.current[i];
        if (!el) return;
        el.style.setProperty("--x", `${b.position.x.toFixed(1)}px`);
        el.style.setProperty("--y", `${(b.position.y - s.sizes[i]!.h / 2).toFixed(1)}px`);
      });
      s.raf = requestAnimationFrame(tick);
    };
    w.raf = requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, effectiveSpread, effectiveLift, pos.map(p => `${p.x},${p.y}`).join("|")]);

  const set = useCallback(
    (next: boolean) => {
      if (!next) stopPhysics();
      setOpen(prev => {
        if (prev === next) return prev;
        latest.current.onOpenChange?.(next);
        return next;
      });
    },
    [stopPhysics],
  );

  useEffect(() => {
    clearTimeout(liveTimer.current);
    if (!open || !physics || latest.current.reduce) {
      if (!open) stopPhysics();
      else if (!physics) stopPhysics();
      return undefined;
    }
    liveTimer.current = setTimeout(startPhysics, openDuration + (n - 1) * stagger + 80);
    return () => clearTimeout(liveTimer.current);
  }, [open, physics, openDuration, stagger, n, startPhysics, stopPhysics]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      latest.current.reduce = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(popTimer.current);
      stopPhysics();
    },
    [stopPhysics],
  );

  const pick = (item: { label: string; value: string }, i: number) => {
    latest.current.onSelect?.(item.value, i);
    clearTimeout(popTimer.current);
    setPopped(i);
    popTimer.current = setTimeout(() => setPopped(-1), 320);
    if (closeOnSelect) set(false);
  };

  const pointerAt = (e: ReactPointerEvent) => {
    const r = anchorRef.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: 0, y: 0 };
  };
  const down = (e: ReactPointerEvent<HTMLButtonElement>, i: number) => {
    const w = world.current;
    if (!w.live || e.button !== 0) return;
    const b = w.bodies[i];
    if (!b) return;
    const p = pointerAt(e);
    w.drag = { i, id: e.pointerId, dx: b.position.x - p.x, dy: b.position.y - p.y, sx: e.clientX, sy: e.clientY, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>, i: number) => {
    const w = world.current;
    const d = w.drag;
    if (!d || d.i !== i || d.id !== e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) >= DRAG_MIN) {
      d.moved = true;
      e.currentTarget.setAttribute("data-drag", "");
    }
    if (!d.moved) return;
    const b = w.bodies[i]!;
    const { w: bw, h: bh } = w.sizes[i]!;
    const z = w.zone!;
    const p = pointerAt(e);
    const x = Math.min(z.right - bw / 2, Math.max(z.left + bw / 2, p.x + d.dx));
    const y = Math.min(z.bottom - bh / 2, Math.max(z.top + bh / 2, p.y + d.dy));
    Body.setVelocity(b, { x: (x - b.position.x) * 0.6, y: (y - b.position.y) * 0.6 });
    Body.setPosition(b, { x, y });
  };
  const up = (e: ReactPointerEvent<HTMLButtonElement>, i: number, item: { label: string; value: string }) => {
    const w = world.current;
    const d = w.drag;
    if (!d || d.i !== i || d.id !== e.pointerId) return;
    w.drag = null;
    e.currentTarget.removeAttribute("data-drag");
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    if (!d.moved && e.type === "pointerup") pick(item, i);
  };

  const hover = trigger === "hover";

  return (
    <div
      className={`folder-float${className ? ` ${className}` : ""}`}
      data-open={open ? "" : undefined}
      data-live={live ? "" : undefined}
      data-physics={physics ? "" : undefined}
      data-trigger={trigger}
      onPointerEnter={hover ? () => set(true) : undefined}
      onPointerLeave={hover ? () => { if (!world.current.drag) set(false); } : undefined}
      onKeyDown={e => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          set(false);
        }
      }}
      style={{
        "--ff-w": `${width}px`,
        "--ff-h": `${height}px`,
        "--ff-r": `${radius}px`,
        "--ff-back": folderColor,
        "--ff-front": frontColor,
        "--ff-paper": paperColor,
        "--ff-item": itemColor,
        "--ff-item-ink": itemTextColor,
        "--ff-label": labelColor,
        "--ff-spread": `${effectiveSpread}px`,
        "--ff-lift": `${effectiveLift}px`,
        "--ff-angle": `${flapAngle}deg`,
        "--ff-rest": `${restAngle}deg`,
        "--ff-open": `${openDuration}ms`,
        "--ff-close": `${Math.round(openDuration * 0.6)}ms`,
        "--ff-stagger": `${stagger}ms`,
        "--ff-n": n,
        "--ff-spring": `cubic-bezier(0.34, ${(1 + bounce * 1.9).toFixed(2)}, 0.64, 1)`,
      } as CSSProperties}
    >
      <div ref={anchorRef} className="folder-float__items">
        {list.map((item, i) => {
          const p = pos[i];
          if (!p) return null;
          return (
            <button
              key={`${item.value}-${i}`}
              ref={el => { pillRefs.current[i] = el; }}
              type="button"
              className="folder-float__item"
              tabIndex={open ? 0 : -1}
              aria-hidden={!open}
              data-pop={popped === i ? "" : undefined}
              style={{ "--i": i, "--x": `${p.x.toFixed(1)}px`, "--y": `${p.y.toFixed(1)}px`, "--r": `${p.r.toFixed(2)}deg` } as CSSProperties}
              onPointerDown={e => down(e, i)}
              onPointerMove={e => move(e, i)}
              onPointerUp={e => up(e, i, item)}
              onPointerCancel={e => up(e, i, item)}
              onClick={e => { if (!world.current.live || e.detail === 0) pick(item, i); }}
            >
              <span className="folder-float__drift">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="folder-float__folder">
        <span className="folder-float__back" aria-hidden="true" />
        <span className="folder-float__paper" aria-hidden="true" />
        <span className="folder-float__front" aria-hidden="true">
          <span className="folder-float__label">{label}</span>
          <span className="folder-float__sub">{sub}</span>
        </span>
        <button type="button" className="folder-float__trigger" aria-expanded={open} aria-label={`${label}, ${sub}`} onClick={() => set(!open)} />
      </div>
    </div>
  );
}
