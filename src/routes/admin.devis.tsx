import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { AdminPager, ADMIN_PAGE_SIZE } from "@/components/admin-pager";
import { listDevis, deleteDevis, type DevisSubmission } from "@/lib/backend/functions";

export const Route = createFileRoute("/admin/devis")({
  head: () => ({
    meta: [
      { title: "Devis | Admin Lahlou Workers" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDevis,
});

function AdminDevis() {
  const [items, setItems] = useState<DevisSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = () =>
    listDevis()
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
    if (!confirm(`Supprimer la demande de ${name || "ce prospect"} ?`)) return;
    await deleteDevis({ data: { id } });
    load();
  };

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold">Demandes de devis</h1>
        <span className="flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-bold">
          <FileText className="h-3.5 w-3.5 text-primary" />
          {items.length}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Demandes reçues via le formulaire en quatre étapes.
      </p>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">Aucune demande pour le moment.</p>
      ) : (
        <>
          <div className="mt-8 hidden grid-cols-12 gap-4 px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:grid">
            <span className="col-span-3">Prospect</span>
            <span className="col-span-7">Projet</span>
            <span className="col-span-2 text-right">Reçu le</span>
          </div>
          <div className="mt-3 grid gap-3">
            {visible.map((item) => (
              <article
                key={item.id}
                className="grid gap-4 border border-border bg-background p-5 transition-colors hover:border-foreground/30 sm:grid-cols-12 sm:gap-4"
              >
                <div className="sm:col-span-3">
                  <p className="font-semibold">{item.name || "—"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.company || "particulier"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.phone}</p>
                  <p className="break-all text-sm text-muted-foreground">{item.email}</p>
                  <p className="mt-2 inline-block border border-border px-2 py-1 text-[11px] font-bold uppercase tracking-wide">
                    {item.channel || "—"}
                  </p>
                </div>
                <div className="sm:col-span-7">
                  <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <span className="text-muted-foreground">Besoin</span>
                      <p className="font-medium">{item.need || "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ville</span>
                      <p className="font-medium">{item.city || "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Surface</span>
                      <p className="font-medium">{item.surface ? `${item.surface} m²` : "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Équipe</span>
                      <p className="font-medium">{item.crewSize} personnes</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Démarrage</span>
                      <p className="font-medium">{item.startDate || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Durée</span>
                      <p className="font-medium">{item.duration || "—"}</p>
                    </div>
                  </div>
                  {item.trades.length > 0 && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Métiers : {item.trades.join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 sm:col-span-2 sm:flex-col sm:items-end sm:justify-start">
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <button
                    onClick={() => remove(item.id, item.name)}
                    aria-label={`Supprimer la demande de ${item.name || "ce prospect"}`}
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
