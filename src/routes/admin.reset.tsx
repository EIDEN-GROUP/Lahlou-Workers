import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
import { requestPasswordReset, resetPassword } from "@/lib/backend/functions";
import { SplitButton } from "@/components/ui/split-button";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/admin/reset")({
  validateSearch: (s: Record<string, unknown>): { token?: string | undefined } => ({
    token: typeof s["token"] === "string" ? s["token"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Mot de passe oublié | Lahlou Workers" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminReset,
});

function AdminReset() {
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setMessage(null);
    try {
      const res = await requestPasswordReset();
      if (res.mailed) {
        setStatus("sent");
      } else {
        setStatus("error");
        setMessage(
          "Email non configuré (SMTP). Ajoutez SMTP_HOST / SMTP_USER / SMTP_PASS puis réessayez.",
        );
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Envoi impossible. Réessayez.");
    }
  };

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setStatus("sending");
    setMessage(null);
    try {
      await resetPassword({ data: { token: token ?? "", password } });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Réinitialisation impossible.");
    }
  };

  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-2">
      {/* Chantier panel */}
      <div className="relative flex min-h-[32svh] flex-col justify-between overflow-hidden bg-foreground text-background lg:min-h-svh">
        <img
          src="/images/siege-login.webp"
          alt="Siège administratif Lahlou Workers à Agadir"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/20 to-foreground/90" />
        <div className="relative p-6 lg:p-10">
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
        </div>
        <div className="relative p-6 lg:p-10">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-background/70">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Sécurité
          </p>
          <p className="mt-4 font-display text-3xl font-bold uppercase leading-[0.95] lg:text-5xl">
            Nouveau mot de passe.
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-background/60">
            Lien à usage unique, valable 1 heure, envoyé à {SITE.email}.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-12 lg:px-12">
        {token ? (
          status === "done" ? (
            <div className="w-full max-w-sm">
              <div className="flex h-11 w-11 items-center justify-center border border-primary bg-primary/15">
                <MailCheck className="h-5 w-5 text-primary" />
              </div>
              <h1 className="mt-6 font-display text-3xl font-bold">Mot de passe changé.</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Connectez-vous avec votre nouveau mot de passe.
              </p>
              <SplitButton href="/admin/login" className="mt-8 w-full">
                Se connecter
              </SplitButton>
            </div>
          ) : (
            <form onSubmit={handleReset} className="w-full max-w-sm">
              <div className="flex h-11 w-11 items-center justify-center border border-primary bg-primary/15">
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
              <h1 className="mt-6 font-display text-3xl font-bold">Choisir un mot de passe</h1>
              <p className="mt-2 text-sm text-muted-foreground">10 caractères minimum.</p>
              <label className="mt-8 grid gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Nouveau mot de passe
                </span>
                <input
                  type="password"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 w-full border border-border bg-background px-4 text-base outline-none transition-colors focus:border-primary"
                />
              </label>
              <label className="mt-4 grid gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Confirmer
                </span>
                <input
                  type="password"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-14 w-full border border-border bg-background px-4 text-base outline-none transition-colors focus:border-primary"
                />
              </label>
              {message && (
                <p role="alert" className="mt-3 text-sm text-primary">
                  {message}
                </p>
              )}
              <SplitButton type="submit" disabled={status === "sending"} className="mt-6 w-full">
                {status === "sending" ? "Enregistrement…" : "Enregistrer"}
              </SplitButton>
            </form>
          )
        ) : status === "sent" ? (
          <div className="w-full max-w-sm">
            <div className="flex h-11 w-11 items-center justify-center border border-primary bg-primary/15">
              <MailCheck className="h-5 w-5 text-primary" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold">Lien envoyé.</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Vérifiez {SITE.email} — le lien est valable 1 heure, utilisable une seule fois.
            </p>
            <Link
              to="/admin/login"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRequest} className="w-full max-w-sm">
            <div className="flex h-11 w-11 items-center justify-center border border-primary bg-primary/15">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold">Mot de passe oublié</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Nous envoyons un lien de réinitialisation à {SITE.email} — valable 1 heure, utilisable
              une seule fois.
            </p>
            {message && (
              <p role="alert" className="mt-3 text-sm text-primary">
                {message}
              </p>
            )}
            <SplitButton type="submit" disabled={status === "sending"} className="mt-6 w-full">
              {status === "sending" ? "Envoi…" : "Envoyer le lien"}
            </SplitButton>
            <Link
              to="/admin/login"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
