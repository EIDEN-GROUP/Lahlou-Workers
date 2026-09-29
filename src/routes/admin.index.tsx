import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Eye, FileText, MessageSquare, Users } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { listContacts, listDevis, listRecruits, listVisits } from "@/lib/backend/functions";
import type {
  ContactSubmission,
  DevisSubmission,
  RecruitSubmission,
  VisitRow,
} from "@/lib/backend/functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Admin | Lahlou Workers" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminOverview,
});

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MIX_COLORS = ["#BF1014", "#0A0A0A", "#8A8A8A"];

function AdminOverview() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [devis, setDevis] = useState<DevisSubmission[]>([]);
  const [recruits, setRecruits] = useState<RecruitSubmission[]>([]);
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Each source fails independently: a missing table (e.g. visits before
    // its migration runs) must never blank the whole dashboard.
    Promise.all([
      listContacts().catch(() => [] as ContactSubmission[]),
      listDevis().catch(() => [] as DevisSubmission[]),
      listRecruits().catch(() => [] as RecruitSubmission[]),
      listVisits().catch(() => [] as VisitRow[]),
    ])
      .then(([c, d, r, v]) => {
        setContacts(c);
        setDevis(d);
        setRecruits(r);
        setVisits(v);
      })
      .finally(() => setLoading(false));
  }, []);

  // Monthly series split by submission type + visits (last 8 months with data).
  const monthly = useMemo(() => {
    const map = new Map<
      string,
      { month: string; contacts: number; devis: number; candidatures: number; visites: number }
    >();
    const bump = (iso: string, key: "contacts" | "devis" | "candidatures" | "visites") => {
      const m = monthKey(iso);
      const row = map.get(m) ?? { month: m, contacts: 0, devis: 0, candidatures: 0, visites: 0 };
      row[key] += 1;
      map.set(m, row);
    };
    contacts.forEach((c) => bump(c.createdAt, "contacts"));
    devis.forEach((d) => bump(d.createdAt, "devis"));
    recruits.forEach((r) => bump(r.createdAt, "candidatures"));
    visits.forEach((v) => bump(v.createdAt, "visites"));
    return [...map.values()].sort((a, b) => a.month.localeCompare(b.month)).slice(-8);
  }, [contacts, devis, recruits, visits]);

  // Cumulative total over time.
  const cumulative = useMemo(() => {
    let total = 0;
    return monthly.map((m) => {
      total += m.contacts + m.devis + m.candidatures;
      return { month: m.month, total };
    });
  }, [monthly]);

  // Visits series for the switcher (day / week / month).
  const [range, setRange] = useState<"day" | "week" | "month">("month");
  const visitSeries = useMemo(() => {
    const now = new Date();
    const inDay = (iso: string, day: Date) => {
      const d = new Date(iso);
      return (
        d.getFullYear() === day.getFullYear() &&
        d.getMonth() === day.getMonth() &&
        d.getDate() === day.getDate()
      );
    };
    if (range === "day") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return Array.from({ length: 24 }, (_, h) => {
        const from = start.getTime() + h * 3_600_000;
        const to = from + 3_600_000;
        return {
          label: `${String(h).padStart(2, "0")}h`,
          visites: visits.filter((v) => {
            const t = new Date(v.createdAt).getTime();
            return t >= from && t < to;
          }).length,
        };
      });
    }
    if (range === "week") {
      return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(now);
        day.setDate(now.getDate() - (6 - i));
        return {
          label: day.toLocaleDateString("fr-FR", { weekday: "short" }),
          visites: visits.filter((v) => inDay(v.createdAt, day)).length,
        };
      });
    }
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = new Date(year, month, i + 1);
      return {
        label: String(i + 1),
        visites: visits.filter((v) => inDay(v.createdAt, day)).length,
      };
    });
  }, [visits, range]);

  const rangeTabs = [
    { id: "day", label: "Aujourd'hui" },
    { id: "week", label: "Cette semaine" },
    { id: "month", label: "Ce mois" },
  ] as const;

  // Submission mix: Contacts / Devis / Candidatures.
  const mix = useMemo(
    () => [
      { name: "Contacts", value: contacts.length },
      { name: "Devis", value: devis.length },
      { name: "Candidatures", value: recruits.length },
    ],
    [contacts, devis, recruits],
  );
  const mixTotal = mix.reduce((n, s) => n + s.value, 0);

  // Latest activity across all three inboxes.
  const recent = useMemo(
    () =>
      [
        ...contacts.map((c) => ({ at: c.createdAt, label: c.name, sub: "Message" })),
        ...devis.map((d) => ({
          at: d.createdAt,
          label: d.name,
          sub: `Devis - ${d.city || "-"}`,
        })),
        ...recruits.map((r) => ({
          at: r.createdAt,
          label: r.name,
          sub: `Candidature - ${r.trade}`,
        })),
      ]
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 6),
    [contacts, devis, recruits],
  );

  const stats = [
    { label: "Contacts", value: contacts.length, icon: MessageSquare },
    { label: "Demandes de devis", value: devis.length, icon: FileText },
    { label: "Candidatures", value: recruits.length, icon: Users },
    { label: "Visites", value: visits.length, icon: Eye },
  ];

  const empty =
    contacts.length === 0 && devis.length === 0 && recruits.length === 0 && visits.length === 0;

  return (
    <AdminShell>
      <h1 className="font-display text-3xl font-bold">Aperçu</h1>
      <p className="mt-2 text-sm text-muted-foreground">Vue d’ensemble de l’activité du site.</p>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="border border-border bg-background p-6">
                <s.icon className="h-5 w-5 text-primary" />
                <p className="mt-4 font-display text-3xl font-bold">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {empty ? (
            <p className="mt-10 text-sm text-muted-foreground">
              Aucune donnée pour le moment - les graphiques apparaîtront dès les premières
              soumissions.
            </p>
          ) : (
            <>
              <div className="mt-8 grid gap-4 lg:grid-cols-5">
                <div className="border border-border bg-background p-6 lg:col-span-3">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-lg font-bold">Visites</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {range === "day"
                          ? "Heure par heure, aujourd'hui."
                          : range === "week"
                            ? "Jour par jour, 7 derniers jours."
                            : "Jour par jour, ce mois-ci."}
                      </p>
                    </div>
                    <div className="flex gap-1.5" role="tablist" aria-label="Période">
                      {rangeTabs.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          role="tab"
                          aria-selected={range === t.id}
                          onClick={() => setRange(t.id)}
                          className={`border px-3 py-2 text-xs font-bold transition-colors ${
                            range === t.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={visitSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 12 }}
                          stroke="var(--muted-foreground)"
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
                          stroke="var(--muted-foreground)"
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="visites"
                          name="Visites"
                          stroke="var(--primary)"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: "var(--primary)" }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border border-border bg-background p-6 lg:col-span-2">
                  <h2 className="font-display text-lg font-bold">Répartition</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Contacts, devis et candidatures.
                  </p>
                  <div className="relative mt-6 h-64">
                    {mixTotal === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune donnée pour le moment.</p>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={mix}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={62}
                              outerRadius={88}
                              paddingAngle={4}
                              strokeWidth={0}
                              startAngle={90}
                              endAngle={-270}
                            >
                              {mix.map((entry, i) => (
                                <Cell key={entry.name} fill={MIX_COLORS[i % MIX_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                          <p className="font-display text-4xl font-bold leading-none">{mixTotal}</p>
                          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Total
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <ul className="mt-4 grid gap-2 border-t border-border pt-4">
                    {mix.map((entry, i) => (
                      <li key={entry.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium">
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: MIX_COLORS[i % MIX_COLORS.length] }}
                          />
                          {entry.name}
                        </span>
                        <span className="font-display font-bold">{entry.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-5">
                <div className="relative overflow-hidden border border-border bg-background p-6 lg:col-span-3">
                  <div className="relative flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h2 className="font-display text-lg font-bold">Total cumulé</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Toutes soumissions confondues.
                      </p>
                    </div>
                    <div className="flex items-end gap-6">
                      <div>
                        <p className="font-display text-4xl font-bold leading-none">
                          {cumulative.length > 0
                            ? (cumulative[cumulative.length - 1]?.total ?? 0)
                            : 0}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Total
                        </p>
                      </div>
                      <div>
                        <p className="font-display text-4xl font-bold leading-none text-primary">
                          +
                          {monthly.length > 0
                            ? (monthly[monthly.length - 1]?.contacts ?? 0) +
                              (monthly[monthly.length - 1]?.devis ?? 0) +
                              (monthly[monthly.length - 1]?.candidatures ?? 0)
                            : 0}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Dernier mois
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-6 h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cumulative}>
                        <defs>
                          <linearGradient id="cumulFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#BF1014" stopOpacity={0.55} />
                            <stop offset="100%" stopColor="#BF1014" stopOpacity={0.04} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                          stroke="var(--muted-foreground)"
                          tickLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
                          stroke="var(--muted-foreground)"
                          tickLine={false}
                          width={32}
                        />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="total"
                          name="Total"
                          stroke="#BF1014"
                          strokeWidth={2.5}
                          fill="url(#cumulFill)"
                          dot={false}
                          activeDot={{ r: 4, fill: "#BF1014", stroke: "#0A0A0A" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border border-border bg-background p-6 lg:col-span-2">
                  <h2 className="font-display text-lg font-bold">Activité récente</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Dernières soumissions.</p>
                  <ul className="mt-6 grid gap-3">
                    {recent.map((r) => (
                      <li
                        key={`${r.at}-${r.label}`}
                        className="flex items-center justify-between gap-4 border-b border-border pb-3 text-sm last:border-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{r.label}</p>
                          <p className="truncate text-xs text-muted-foreground">{r.sub}</p>
                        </div>
                        <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                          {new Date(r.at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </AdminShell>
  );
}
