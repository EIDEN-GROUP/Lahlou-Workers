import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { adminMe, login } from "@/lib/backend/functions";
import { SplitButton } from "@/components/ui/split-button";
import { SITE } from "@/lib/site";
import loginSide from "@/assets/lahlou-craft.webp";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Connexion | Lahlou Workers" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

const INSIDE = ["Contacts", "Devis", "Candidatures", "Visites"];

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
    <div className="grid min-h-svh bg-background lg:grid-cols-2">
      {/* Chantier panel */}
      <div className="relative flex min-h-[42svh] flex-col justify-between overflow-hidden bg-foreground text-background lg:min-h-svh">
        <img
          src="/images/siege-login.webp"
          alt="Siège administratif Lahlou Workers à Agadir"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/20 to-foreground/90" />
        <div className="relative flex items-center justify-between p-6 lg:p-10">
          <a
            href="/"
            aria-label="Lahlou Workers, accueil"
            className="font-display text-xl font-bold leading-[0.82] tracking-tight"
          >
            <span className="block">
              lah<span className="text-primary">l</span>ou
            </span>
            <span className="block">workers</span>
          </a>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-background/70">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Espace réservé
          </p>
        </div>
        <div className="relative p-6 lg:p-10">
          <div className="flex items-end gap-5 border-t border-background/25 pt-6">
            <img
              src={loginSide}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="hidden h-24 w-32 shrink-0 border border-background/25 object-cover sm:block lg:h-28 lg:w-40"
            />
            <div>
              <p className="font-display text-3xl font-bold uppercase leading-[0.95] lg:text-5xl">
                Pilotez vos chantiers.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {INSIDE.map((label) => (
                  <li
                    key={label}
                    className="border border-background/25 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-background/80"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-6 text-xs text-background/50">
            {SITE.address.city}, {SITE.address.country} · ICE {SITE.ice}
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-12 lg:px-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="flex h-11 w-11 items-center justify-center border border-primary bg-primary/15">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold">Se connecter</h1>
          <p className="mt-2 text-sm text-muted-foreground">Accès réservé à l’administrateur.</p>
          <label className="mt-8 grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Mot de passe
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-14 w-full border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
            />
          </label>
          {error && (
            <p role="alert" className="mt-3 text-sm text-primary">
              {error}
            </p>
          )}
          <div className="mt-3 flex justify-end">
            <Link
              to="/admin/reset"
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <SplitButton type="submit" disabled={checking} className="mt-6 w-full">
            {checking ? "Vérification…" : "Se connecter"}
          </SplitButton>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au site
          </Link>
        </form>
      </div>
    </div>
  );
}
