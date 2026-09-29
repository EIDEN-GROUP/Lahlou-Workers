import { ChevronLeft, ChevronRight } from "lucide-react";

export const ADMIN_PAGE_SIZE = 8;

function pageWindow(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, 2, page - 1, page, page + 1, total - 1, total]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - (nums[i - 1] ?? 0) > 1) out.push("…");
    out.push(n);
  });
  return out;
}

export function AdminPager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const btn =
    "flex h-9 min-w-9 items-center justify-center gap-1 border border-border bg-background px-2.5 text-xs font-semibold transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border";
  return (
    <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <p className="text-xs text-muted-foreground">
        Page {page} sur {totalPages}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Page précédente"
          className={btn}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Précédent</span>
        </button>
        {pageWindow(page, totalPages).map((n, i) =>
          n === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-label={`Page ${n}`}
              aria-current={n === page ? "page" : undefined}
              className={`${btn} ${n === page ? "border-primary bg-primary text-primary-foreground hover:border-primary" : ""}`}
            >
              {n}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Page suivante"
          className={btn}
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
