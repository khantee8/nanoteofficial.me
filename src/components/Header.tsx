import Link from "next/link";
import { profile } from "@/lib/profile";
import { t, type Lang } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import { Logo } from "@/components/Logo";

export function Header({ lang }: { lang: Lang }) {
  const nav = [
    { href: "/#about", label: t("nav.about", lang) },
    { href: "/#experience", label: t("nav.experience", lang) },
    { href: "/#projects", label: t("nav.projects", lang) },
    { href: "/#roadmap", label: t("nav.roadmap", lang) },
    { href: "/#contact", label: t("nav.contact", lang) },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[var(--background)]/85 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/65">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-4">
        <Logo />
        <nav className="hidden lg:flex items-center gap-6 text-sm text-[var(--muted)]">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="hover:text-[var(--foreground)] transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LangToggle current={lang} />
          <a
            href={`mailto:${profile.email}`}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] text-[var(--background)] px-4 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t("cta.hire", lang)}
          </a>
        </div>
      </div>
    </header>
  );
}
