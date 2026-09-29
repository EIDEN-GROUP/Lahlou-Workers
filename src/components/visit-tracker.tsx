// Anonymous page-view tracking (path only — no IPs, cookies or fingerprints).
// Mounted once in the public PageShell; fires on every route change.
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { trackVisit } from "@/lib/backend/functions";

export function VisitTracker() {
  // href is a plain string (pathname + serialized search) — unlike
  // location.search, which is a parsed params object and can't be coerced.
  const href = useRouterState({ select: (s) => s.location.href });
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (last.current === href) return;
    last.current = href;
    const path = href.split("?")[0] ?? "/";
    trackVisit({ data: { path } }).catch(() => {});
  }, [href]);

  return null;
}
