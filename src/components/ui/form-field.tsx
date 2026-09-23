import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function FormPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border border-background/12 bg-background/[0.04] p-6 backdrop-blur-sm lg:p-8 ${className ?? ""}`}>
      {children}
    </div>
  );
}

export function FormField({
  label,
  icon: Icon,
  children,
  tone = "dark",
}: {
  label: string;
  icon?: LucideIcon;
  children: ReactNode;
  /** "dark" for forms sitting on a dark background (default), "light" for forms on light panels (e.g. the admin dashboard). */
  tone?: "dark" | "light";
}) {
  return (
    <label className="grid gap-2">
      <span className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${tone === "dark" ? "text-background/60" : "text-muted-foreground"}`}>
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        {label}
      </span>
      {children}
    </label>
  );
}

export const fieldClassName =
  "h-14 w-full border border-background/15 bg-background/[0.03] px-4 text-base text-background appearance-none rounded-none outline-none transition-colors placeholder:text-background/35 focus:border-primary focus:bg-background/[0.06]";

export const textareaClassName =
  "w-full border border-background/15 bg-background/[0.03] px-4 py-3 text-base text-background appearance-none rounded-none outline-none transition-colors placeholder:text-background/35 focus:border-primary focus:bg-background/[0.06]";

// Light-panel variants (e.g. the admin dashboard, which sits on a light background).
export const lightFieldClassName =
  "h-14 w-full border border-border bg-background px-4 text-base text-foreground appearance-none rounded-none outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary";
