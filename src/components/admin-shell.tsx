import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, MessageSquare, FileText, Users, Building2, LogOut } from "lucide-react";
import { adminMe, logout } from "@/lib/backend/functions";

const navItems = [
  { to: "/admin", label: "Aperçu", icon: LayoutDashboard },
  { to: "/admin/contacts", label: "Contacts", icon: MessageSquare },
  { to: "/admin/devis", label: "Devis", icon: FileText },
  { to: "/admin/recrutement", label: "Recrutement", icon: Users },
  { to: "/admin/projects", label: "Projets", icon: Building2 },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let live = true;
    adminMe()
      .then((r) => {
        if (!live) return;
        if (!r.authed) navigate({ to: "/admin/login" });
        else setChecked(true);
      })
      .catch(() => navigate({ to: "/admin/login" }));
    return () => {
      live = false;
    };
  }, [navigate]);

  if (!checked)
    return (
      <div className="flex min-h-svh items-center justify-center bg-foreground text-background">
        Chargement…
      </div>
    );

  return (
    <div className="flex min-h-svh flex-col bg-secondary text-foreground lg:flex-row">
      <aside className="flex shrink-0 flex-row items-center gap-2 overflow-x-auto border-b border-border bg-background px-4 py-4 lg:w-60 lg:flex-col lg:items-stretch lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
        <div className="mb-0 px-2 font-display text-lg font-bold lg:mb-8">
          lah<span className="text-primary">l</span>ou{" "}
          <span className="block text-sm font-semibold text-muted-foreground">Admin</span>
        </div>
        <nav className="flex gap-1 lg:grid">
          {navItems.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 whitespace-nowrap px-3 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={async () => {
            try {
              await logout();
            } finally {
              navigate({ to: "/admin/login" });
            }
          }}
          className="ml-auto flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:text-primary lg:ml-0 lg:mt-auto"
        >
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </aside>
      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
