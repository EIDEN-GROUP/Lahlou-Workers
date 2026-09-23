import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { login } from "@/lib/backend/functions";
import { setAdminAuthed, isAdminAuthed } from "@/components/admin-shell";
import { SplitButton } from "@/components/ui/split-button";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Connexion — Lahlou Workers" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (isAdminAuthed()) navigate({ to: "/admin" });
  }, [navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setChecking(true);
    setError(false);
    try {
      const res = await login({ data: { password } });
      if (res.ok) {
        setAdminAuthed(true);
        navigate({ to: "/admin" });
      } else {
        setError(true);
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-foreground px-5 text-background">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-background/15 bg-background/[0.04] p-8">
        <div className="flex h-11 w-11 items-center justify-center border border-primary bg-primary/15"><Lock className="h-5 w-5 text-primary" /></div>
        <h1 className="mt-6 font-display text-2xl font-bold">Espace admin</h1>
        <p className="mt-2 text-sm text-background/60">Lahlou Workers — accès réservé.</p>
        <label className="mt-8 grid gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-background/60">Mot de passe</span>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="h-14 w-full border border-background/15 bg-background/[0.03] px-4 text-base text-background outline-none focus:border-primary"
          />
        </label>
        {error && <p className="mt-3 text-sm text-primary">Mot de passe incorrect.</p>}
        <SplitButton type="submit" disabled={checking} className="mt-6 w-full">{checking ? "Vérification…" : "Se connecter"}</SplitButton>
      </form>
    </div>
  );
}
