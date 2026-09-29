// Horizontal text-only timeline ("Étapes suivies").
// The page renders the heading — this is just the ruled line, progress rail
// and numbered nodes. Desktop: grid row. Mobile: snap-scrolling row.
// Vault-timeline language: a red progress rail draws across as the section
// scrolls through, and each node lights up as the fill reaches it.
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState } from "react";
import { Stagger, StaggerItem } from "@/components/scroll-fx";

export interface TimelineStep {
  title: string;
  text: string;
}

function TimelineNode({
  progress,
  index,
  total,
  step,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  step: TimelineStep;
}) {
  const t = total <= 1 ? 1 : index / (total - 1);
  const activation = useTransform(progress, [Math.max(0, t - 0.08), Math.min(1, t + 0.02)], [0, 1]);
  const [lit, setLit] = useState(index === 0);
  useMotionValueEvent(activation, "change", (v) => setLit(v > 0.5));

  return (
    <StaggerItem className="relative w-[78vw] shrink-0 snap-start border-t border-border pt-6 pr-6 sm:w-[46vw] lg:w-auto lg:pr-8">
      <span
        aria-hidden="true"
        className={`absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full transition-colors duration-300 ${
          lit ? "bg-primary" : "bg-muted-foreground/40"
        }`}
      />
      <p className="font-display text-xs font-bold text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-3 font-display text-xl font-bold lg:text-2xl">{step.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
    </StaggerItem>
  );
}

export function ProjectTimeline({ steps }: { steps: TimelineStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: progress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });

  return (
    <div ref={ref} className="relative mt-14">
      {/* base rail + red progress fill */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 hidden h-[2px] bg-border lg:block"
      >
        <motion.div className="h-full w-full origin-left bg-primary" style={{ scaleX: progress }} />
      </div>
      <Stagger className="flex snap-x snap-mandatory gap-0 overflow-x-auto pb-4 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0">
        {steps.map((s, i) => (
          <TimelineNode key={s.title} progress={progress} index={i} total={steps.length} step={s} />
        ))}
      </Stagger>
    </div>
  );
}
