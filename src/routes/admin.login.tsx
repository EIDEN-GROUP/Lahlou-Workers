import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { adminMe, login } from "@/lib/backend/functions";
import { SplitButton } from "@/components/ui/split-button";

export const Route = createFileRoute("/admin/login")({
  // Empêche l'indexation du login admin (défense en profondeur, robots.txt aussi)
  head: () => ({
    meta: [
      { title: "Connexion | Lahlou Workers" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    adminMe()
      .then((r) => {
        if (r.authed) navigate({ to: "/admin" });
      })
      .catch(() => {});
  }, [navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      const res = (await login({ data: { password } })) as { ok?: boolean } | Response;
      // login peut renvoyer un Response (Set-Cookie) — fetch le suit déjà côté TanStack
      const ok = res instanceof Response ? res.ok : (res as { ok?: boolean }).ok;
      if (ok) {
        setPassword("");
        navigate({ to: "/admin" });
      } else {
        setError("Mot de passe incorrect.");
      }
    } catch {
      setError("Connexion impossible. Vérifiez la configuration serveur puis réessayez.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-foreground px-5 text-background">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-background/15 bg-background/[0.04] p-8"
      >
        <div className="flex h-11 w-11 items-center justify-center border border-primary bg-primary/15">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">Espace admin</h1>
        <p className="mt-2 text-sm text-background/60">Lahlou Workers - accès réservé.</p>
        <label className="mt-8 grid gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-background/60">
            Mot de passe
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 w-full border border-background/15 bg-background/[0.03] px-4 text-base text-background outline-none focus:border-primary"
          />
        </label>
        {error && (
          <p role="alert" className="mt-3 text-sm text-primary">
            {error}
          </p>
        )}
        <SplitButton type="submit" disabled={checking} className="mt-6 w-full">
          {checking ? "Vérification…" : "Se connecter"}
        </SplitButton>
      </form>
    </div>
  );
}
