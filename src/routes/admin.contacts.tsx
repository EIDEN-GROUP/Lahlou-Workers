import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { listContacts, deleteContact, type ContactSubmission } from "@/lib/backend/functions";

export const Route = createFileRoute("/admin/contacts")({
  head: () => ({ meta: [{ title: "Contacts — Admin Lahlou Workers" }] }),
  component: AdminContacts,
});

function AdminContacts() {
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => listContacts().then(setItems);
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const remove = async (id: string) => {
    await deleteContact({ data: { id } });
    load();
  };

  return (
    <AdminShell>
      <h1 className="font-display text-3xl font-bold">Contacts</h1>
      <p className="mt-2 text-sm text-muted-foreground">Messages reçus depuis le formulaire de contact.</p>

      {loading ? <p className="mt-10 text-sm text-muted-foreground">Chargement…</p> : items.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">Aucun message pour le moment.</p>
      ) : (
        <div className="mt-8 grid gap-3">
          {items.map(item => (
            <div key={item.id} className="border border-border bg-background p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.name} <span className="text-muted-foreground">— {item.phone}</span></p>
                  <p className="text-sm text-muted-foreground">{item.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString("fr-FR")}</span>
                  <button onClick={() => remove(item.id)} aria-label="Supprimer" className="text-muted-foreground hover:text-primary"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
