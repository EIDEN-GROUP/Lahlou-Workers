import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Trash2, Users } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { AdminPager, ADMIN_PAGE_SIZE } from "@/components/admin-pager";
import { listRecruits, deleteRecruit, type RecruitSubmission } from "@/lib/backend/functions";

export const Route = createFileRoute("/admin/recrutement")({
  head: () => ({
    meta: [
      { title: "Recrutement | Admin Lahlou Workers" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRecrutement,
});

function AdminRecrutement() {
  const [items, setItems] = useState<RecruitSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = () =>
    listRecruits()
      .then(setItems)
      .catch(() => setItems([]));
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / ADMIN_PAGE_SIZE));
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const visible = useMemo(
    () => items.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE),
    [items, page],
  );

  const remove = async (id: string, name: string) => {
    if (!confirm(`Supprimer la candidature de ${name} ?`)) return;
    await deleteRecruit({ data: { id } });
    load();
  };

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold">Candidatures</h1>
        <span className="flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-bold">
          <Users className="h-3.5 w-3.5 text-primary" />
          {items.length}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Candidatures reçues via la page Recrutement.
      </p>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">Aucune candidature pour le moment.</p>
      ) : (
        <>
          <div className="mt-8 hidden grid-cols-12 gap-4 px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:grid">
            <span className="col-span-5">Candidat</span>
            <span className="col-span-5">Profil</span>
            <span className="col-span-2 text-right">Reçu le</span>
          </div>
          <div className="mt-3 grid gap-3">
            {visible.map((item) => (
              <article
                key={item.id}
                className="grid gap-3 border border-border bg-background p-5 transition-colors hover:border-foreground/30 sm:grid-cols-12 sm:items-center sm:gap-4"
              >
                <div className="sm:col-span-5">
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.phone}</p>
                </div>
                <div className="sm:col-span-5">
                  <p className="inline-block border border-primary bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {item.trade}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.city} · {item.experience} ans d’expérience
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:col-span-2 sm:flex-col sm:items-end sm:justify-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <button
                    onClick={() => remove(item.id, item.name)}
                    aria-label={`Supprimer la candidature de ${item.name}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sm:hidden">Supprimer</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
          <AdminPager page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </AdminShell>
  );
}
