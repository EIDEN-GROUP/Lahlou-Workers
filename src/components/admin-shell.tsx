import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, MessageSquare, FileText, Users, Building2, LogOut } from "lucide-react";

const AUTH_KEY = "lahlou_admin_session";

export function isAdminAuthed() {
  return typeof window !== "undefined" && window.localStorage.getItem(AUTH_KEY) === "1";
}

export function setAdminAuthed(v: boolean) {
  if (v) window.localStorage.setItem(AUTH_KEY, "1");
  else window.localStorage.removeItem(AUTH_KEY);
}

const navItems = [
  { to: "/admin", label: "Aperçu", icon: LayoutDashboard },
  { to: "/admin/contacts", label: "Contacts", icon: MessageSquare },
  { to: "/admin/devis", label: "Devis", icon: FileText },
  { to: "/admin/recrutement", label: "Recrutement", icon: Users },
  { to: "/admin/projects", label: "Projets", icon: Building2 },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: s => s.location.pathname });
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAdminAuthed()) {
      navigate({ to: "/admin/login" });
    } else {
      setChecked(true);
    }
  }, [navigate]);

  if (!checked) return <div className="flex min-h-svh items-center justify-center bg-foreground text-background">Chargement…</div>;

  return (
    <div className="flex min-h-svh bg-secondary text-foreground">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-background px-4 py-6">
        <div className="mb-8 px-2 font-display text-lg font-bold">
          lah<span className="text-primary">l</span>ou <span className="block text-sm font-semibold text-muted-foreground">Admin</span>
        </div>
        <nav className="grid gap-1">
          {navItems.map(item => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => { setAdminAuthed(false); navigate({ to: "/admin/login" }); }}
          className="mt-auto flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </aside>
      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
