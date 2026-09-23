import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { MessageSquare, FileText, Users, Building2 } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { listContacts, listDevis, listRecruits, listProjects } from "@/lib/backend/functions";
import type { ContactSubmission, DevisSubmission, RecruitSubmission, AdminProject } from "@/lib/backend/functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — Lahlou Workers" }] }),
  component: AdminOverview,
});

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function AdminOverview() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [devis, setDevis] = useState<DevisSubmission[]>([]);
  const [recruits, setRecruits] = useState<RecruitSubmission[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listContacts(), listDevis(), listRecruits(), listProjects()]).then(([c, d, r, p]) => {
      setContacts(c);
      setDevis(d);
      setRecruits(r);
      setProjects(p);
      setLoading(false);
    });
  }, []);

  const all = [...contacts.map(c => c.createdAt), ...devis.map(d => d.createdAt), ...recruits.map(r => r.createdAt)];
  const byMonth = new Map<string, number>();
  all.forEach(iso => byMonth.set(monthKey(iso), (byMonth.get(monthKey(iso)) ?? 0) + 1));
  const chartData = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count }));

  const stats = [
    { label: "Contacts", value: contacts.length, icon: MessageSquare },
    { label: "Demandes de devis", value: devis.length, icon: FileText },
    { label: "Candidatures", value: recruits.length, icon: Users },
    { label: "Projets ajoutés", value: projects.length, icon: Building2 },
  ];

  return (
    <AdminShell>
      <h1 className="font-display text-3xl font-bold">Aperçu</h1>
      <p className="mt-2 text-sm text-muted-foreground">Vue d’ensemble de l’activité du site.</p>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(s => (
              <div key={s.label} className="border border-border bg-background p-6">
                <s.icon className="h-5 w-5 text-primary" />
                <p className="mt-4 font-display text-3xl font-bold">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 border border-border bg-background p-6">
            <h2 className="font-display text-lg font-bold">Soumissions par mois</h2>
            <p className="mt-1 text-sm text-muted-foreground">Contacts, devis et candidatures combinés.</p>
            <div className="mt-6 h-64">
              {chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune donnée pour le moment.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--primary)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
