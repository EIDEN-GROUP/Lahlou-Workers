import { Instagram, Linkedin, Phone } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { SplitButton } from "@/components/ui/split-button";
import footerWordmarkScaffold from "@/assets/decor/footer-wordmark-scaffold-dark.png";

export type HeaderVariant = "light" | "hero" | "dark";

const menuStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const menuItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export const navLinks: [string, string][] = [
  ["Accueil", "/"],
  ["Projets", "/realisations"],
  ["Recrutement", "/recrutement"],
  ["Contact", "/contact"],
];

const socials = [
  ["Instagram", "https://instagram.com/lahlou.workers", Instagram],
  ["LinkedIn", "https://linkedin.com/company/lahlou-workersconstruction", Linkedin],
] as const;

export function Wordmark({ inverse = false, className, accentClassName = "text-primary" }: { inverse?: boolean; className?: string; accentClassName?: string }) {
  return (
    <a href="/" aria-label="Lahlou Workers, accueil" className={`font-display font-bold leading-[0.82] tracking-tight ${inverse ? "text-background" : "text-foreground"} ${className ?? "text-[15px]"}`}>
      <span className="block">lah<span className={accentClassName}>l</span>ou</span>
      <span className="block">workers</span>
    </a>
  );
}

export function Eyebrow({ label }: { label: string }) {
  return <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><span className="h-2 w-2 rounded-full bg-primary" />{label}</p>;
}

function MenuToggle({ open, inverse, scrolled, onClick }: { open: boolean; inverse: boolean; scrolled: boolean; onClick: () => void }) {
  const badge = scrolled && !open;
  const color = badge ? "var(--background)" : inverse ? "var(--background)" : "var(--foreground)";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
      className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${badge ? "bg-primary shadow-lg" : ""}`}
    >
      <span className="relative block h-5 w-9">
        <motion.span
          className="absolute left-0 top-0 h-[3px] w-9 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ rotate: open ? 45 : 0, y: open ? 8 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.span
          className="absolute left-0 top-1/2 h-[3px] w-9 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="absolute bottom-0 left-0 h-[3px] w-9 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ rotate: open ? -45 : 0, y: open ? -8 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </span>
    </button>
  );
}

export function SectionHead({ label, title, red, center }: { label: string; title: string; red?: string; center?: boolean }) {
  const parts = red ? title.split(red) : [title];
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : ""}>
      <div className={center ? "flex justify-center" : ""}><Eyebrow label={label} /></div>
      <h2 className="mt-6 font-display text-[28px] font-bold uppercase leading-[0.95] lg:text-[52px]">{parts[0]}{red && <span className="text-primary">{red}</span>}{parts[1]}</h2>
    </div>
  );
}

export function SiteHeader({ variant = "light" }: { variant?: HeaderVariant }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      if (variant === "hero") setScrolledPastHero(window.scrollY > 420);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const inverse = menuOpen || variant === "dark" || (variant === "hero" && !scrolledPastHero);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-transparent">
      <div className="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between px-5 lg:px-8">
        <div className={`flex items-center justify-center rounded-full transition-all duration-300 ${scrolled && !menuOpen ? "bg-primary px-5 py-2.5 shadow-lg" : "px-0 py-0"}`}>
          <Wordmark inverse={scrolled && !menuOpen ? true : inverse} accentClassName={scrolled && !menuOpen ? "text-background" : "text-primary"} className="text-[20px] lg:text-[23px]" />
        </div>
        <MenuToggle open={menuOpen} inverse={inverse} scrolled={scrolled} onClick={() => setMenuOpen(!menuOpen)} />
      </div>
      <AnimatePresence>
        {menuOpen && <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="fixed inset-0 -z-10 flex min-h-svh flex-col bg-foreground px-5 pb-8 pt-28 text-background lg:px-8"
          aria-label="Navigation principale"
        >
          <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center justify-center">
            <motion.div className="grid w-full max-w-2xl" initial="hidden" animate="show" exit="hidden" variants={menuStagger}>
              {navLinks.map(([a, b], i) => <motion.a key={b} href={b} variants={menuItem} className="group flex items-baseline gap-5 border-b border-background/10 py-4 transition-colors hover:text-primary sm:py-5" onClick={() => setMenuOpen(false)}>
                <span className="font-display text-xs font-bold text-background/40 transition-colors group-hover:text-primary">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-[15vw] font-bold leading-[0.95] sm:text-[64px] lg:text-[80px]">{a}</span>
              </motion.a>)}
              <motion.div variants={menuItem} className="mt-10"><SplitButton href="/devis" onClick={() => setMenuOpen(false)}>Demander une équipe</SplitButton></motion.div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.1 + navLinks.length * 0.07, duration: 0.4 } }}
            exit={{ opacity: 0 }}
            className="mx-auto flex w-full max-w-[1440px] items-end justify-between pt-8 text-xs text-background/60"
          >
            <a href="mailto:contact@lahlou-workers.com" className="hover:text-background">contact@lahlou-workers.com</a>
            <div className="flex items-center gap-3">{socials.map(([label, href, Icon]) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-background/25 transition-colors hover:border-background hover:text-primary"><Icon className="h-4 w-4" /></a>)}</div>
          </motion.div>
        </motion.nav>}
      </AnimatePresence>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="sticky top-0 z-10 bg-foreground text-background">
      <div className="mx-auto max-w-[1440px] px-5 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-12 border-t border-background/20 pt-12 lg:grid-cols-12">
          <div className="lg:col-span-5"><Wordmark inverse className="text-[22px]" /><p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">Construction haut de gamme depuis Agadir : résidences de standing et immeubles de bureaux, du gros œuvre à la livraison.</p><div className="mt-6 flex items-center gap-3">{socials.map(([label, href, Icon]) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-background/25 transition-colors hover:border-background hover:text-primary"><Icon className="h-4 w-4" /></a>)}</div></div>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
            <div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Navigation</p><div className="mt-5 grid gap-3 text-sm"><a href="/">Accueil</a><a href="/realisations">Projets</a><a href="/recrutement">Recrutement</a><a href="/contact">Contact</a></div></div>
            <div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Écrire</p><div className="mt-5 grid gap-3 text-sm"><a href="mailto:contact@lahlou-workers.com">contact@lahlou-workers.com</a><a href="/devis">Demander une équipe</a></div></div>
            <div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Adresse</p><p className="mt-5 text-sm">N°118 Avenue Tanger<br/>Agadir, Maroc</p></div>
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between"><span>© 2026 Lahlou Workers — ICE 003157258000059 · RC 053457</span><span>Gros œuvre · Travaux d’aménagement</span></div>
        <div className="pt-3 text-xs text-muted-foreground/70">Développé par Eiden Group</div>
      </div>
      <div className="relative flex h-[90px] items-center justify-center overflow-hidden border-t border-background/10 lg:h-[150px]">
        <img
          src={footerWordmarkScaffold}
          alt="Lahlou Workers"
          aria-hidden
          className="h-full w-auto max-w-none opacity-60"
        />
      </div>
    </footer>
  );
}

export function WhatsAppButton() {
  return <a href="https://wa.me/212600000000" target="_blank" rel="noreferrer" aria-label="Contacter Lahlou Workers sur WhatsApp" className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-background/20 bg-primary text-primary-foreground shadow-lg transition-transform hover:-translate-y-1"><Phone/></a>;
}

export function PageShell({ children, header = "light" }: { children: ReactNode; header?: HeaderVariant }) {
  return <main>
    <SiteHeader variant={header} />
    {children}
    <SiteFooter />
    <WhatsAppButton />
  </main>;
}
