import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { listRecruits, deleteRecruit, type RecruitSubmission } from "@/lib/backend/functions";

export const Route = createFileRoute("/admin/recrutement")({
  head: () => ({ meta: [{ title: "Recrutement — Admin Lahlou Workers" }] }),
  component: AdminRecrutement,
});

function AdminRecrutement() {
  const [items, setItems] = useState<RecruitSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => listRecruits().then(setItems);
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const remove = async (id: string) => {
    await deleteRecruit({ data: { id } });
    load();
  };

  return (
    <AdminShell>
      <h1 className="font-display text-3xl font-bold">Candidatures</h1>
      <p className="mt-2 text-sm text-muted-foreground">Candidatures reçues via la page Recrutement.</p>

      {loading ? <p className="mt-10 text-sm text-muted-foreground">Chargement…</p> : items.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">Aucune candidature pour le moment.</p>
      ) : (
        <div className="mt-8 grid gap-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between gap-4 border border-border bg-background p-5">
              <div>
                <p className="font-semibold">{item.name} <span className="text-muted-foreground">— {item.trade}</span></p>
                <p className="text-sm text-muted-foreground">{item.city} · {item.experience} ans d’expérience · {item.phone}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString("fr-FR")}</span>
                <button onClick={() => remove(item.id)} aria-label="Supprimer" className="text-muted-foreground hover:text-primary"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
