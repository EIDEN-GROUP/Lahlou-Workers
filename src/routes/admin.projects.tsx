import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Trash2, Plus } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { SplitButton } from "@/components/ui/split-button";
import { FormField, lightFieldClassName } from "@/components/ui/form-field";
import { listProjects, submitProject, deleteProject, type AdminProject } from "@/lib/backend/functions";

export const Route = createFileRoute("/admin/projects")({
  head: () => ({ meta: [{ title: "Projets — Admin Lahlou Workers" }] }),
  component: AdminProjects,
});

function AdminProjects() {
  const [items, setItems] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => listProjects().then(setItems);
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const remove = async (id: string) => {
    await deleteProject({ data: { id } });
    load();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await submitProject({ data: {
        category: String(fd.get("category") ?? ""),
        title: String(fd.get("title") ?? ""),
        city: String(fd.get("city") ?? ""),
        year: String(fd.get("year") ?? ""),
        description: String(fd.get("description") ?? ""),
        image: String(fd.get("image") ?? ""),
      } });
      e.currentTarget.reset();
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <h1 className="font-display text-3xl font-bold">Projets</h1>
      <p className="mt-2 text-sm text-muted-foreground">Les projets ajoutés ici apparaissent automatiquement (avec l’animation de pile) sur la page Projets publique.</p>

      <div className="mt-8 border border-border bg-background p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Plus className="h-4 w-4 text-primary" /> Ajouter un chantier livré</h2>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Catégorie" tone="light"><select required name="category" defaultValue="" className={lightFieldClassName}>
              <option value="" disabled>Choisir</option>
              <option>Résidentiel</option>
              <option>Commercial</option>
              <option>Industriel</option>
              <option>Rénovation</option>
            </select></FormField>
            <FormField label="Nom du projet" tone="light"><input required name="title" type="text" placeholder="Résidence les Palmiers" className={lightFieldClassName} /></FormField>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Ville" tone="light"><input required name="city" type="text" placeholder="Agadir" className={lightFieldClassName} /></FormField>
            <FormField label="Année" tone="light"><input required name="year" type="text" placeholder="2026" className={lightFieldClassName} /></FormField>
          </div>
          <FormField label="Description courte" tone="light"><input required name="description" type="text" placeholder="Ensemble résidentiel livré clé en main." className={lightFieldClassName} /></FormField>
          <FormField label="URL de l’image" tone="light"><input required name="image" type="url" placeholder="https://…" className={lightFieldClassName} /></FormField>
          <SplitButton type="submit" disabled={saving} className="justify-self-start">{saving ? "Ajout…" : "Ajouter le projet"}</SplitButton>
        </form>
      </div>

      <h2 className="mt-10 font-display text-lg font-bold">Projets ajoutés ({items.length})</h2>
      {loading ? <p className="mt-4 text-sm text-muted-foreground">Chargement…</p> : items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Aucun projet ajouté pour le moment — les projets historiques restent affichés par défaut.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <div key={item.id} className="relative border border-border bg-background">
              <button onClick={() => remove(item.id)} aria-label="Supprimer" className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center bg-foreground/70 text-background hover:text-primary"><Trash2 className="h-4 w-4" /></button>
              <img src={item.image} alt={item.title} className="h-36 w-full object-cover" />
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.category} · {item.year}</p>
                <p className="mt-1 font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.city}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
