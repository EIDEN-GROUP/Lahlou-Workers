import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
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

  const load = () => listDevis().then(setItems);
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const remove = async (id: string) => {
    await deleteDevis({ data: { id } });
    load();
  };

  return (
    <AdminShell>
      <h1 className="font-display text-3xl font-bold">Demandes de devis</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Demandes reçues via le formulaire en quatre étapes.
      </p>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">Aucune demande pour le moment.</p>
      ) : (
        <div className="mt-8 grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="border border-border bg-background p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {item.name || "-"}{" "}
                    <span className="text-muted-foreground">| {item.company || "particulier"}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.phone} · {item.email}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <button
                    onClick={() => remove(item.id)}
                    aria-label="Supprimer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <span className="text-muted-foreground">Besoin</span>
                  <p className="font-medium">{item.need || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ville</span>
                  <p className="font-medium">{item.city || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Surface</span>
                  <p className="font-medium">{item.surface ? `${item.surface} m²` : "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Équipe</span>
                  <p className="font-medium">{item.crewSize} personnes</p>
                </div>
              </div>
              {item.trades.length > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Métiers : {item.trades.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
