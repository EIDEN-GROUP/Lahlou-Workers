import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Inbox, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { AdminPager, ADMIN_PAGE_SIZE } from "@/components/admin-pager";
import { listContacts, deleteContact, type ContactSubmission } from "@/lib/backend/functions";

export const Route = createFileRoute("/admin/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts | Admin Lahlou Workers" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminContacts,
});

function AdminContacts() {
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = () =>
    listContacts()
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
    if (!confirm(`Supprimer le message de ${name} ?`)) return;
    await deleteContact({ data: { id } });
    load();
  };

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold">Contacts</h1>
        <span className="flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-bold">
          <Inbox className="h-3.5 w-3.5 text-primary" />
          {items.length}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Messages reçus depuis le formulaire de contact.
      </p>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">Aucun message pour le moment.</p>
      ) : (
        <>
          <div className="mt-8 hidden grid-cols-12 gap-4 px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:grid">
            <span className="col-span-4">Expéditeur</span>
            <span className="col-span-6">Message</span>
            <span className="col-span-2 text-right">Reçu le</span>
          </div>
          <div className="mt-3 grid gap-3">
            {visible.map((item) => (
              <article
                key={item.id}
                className="grid gap-3 border border-border bg-background p-5 transition-colors hover:border-foreground/30 sm:grid-cols-12 sm:items-start sm:gap-4"
              >
                <div className="sm:col-span-4">
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.phone}</p>
                  <p className="break-all text-sm text-muted-foreground">{item.email}</p>
                </div>
                <p className="text-sm leading-relaxed sm:col-span-6">{item.message}</p>
                <div className="flex items-center justify-between gap-3 sm:col-span-2 sm:flex-col sm:items-end sm:justify-start">
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <button
                    onClick={() => remove(item.id, item.name)}
                    aria-label={`Supprimer le message de ${item.name}`}
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
