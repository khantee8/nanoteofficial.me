import { profile } from "@/lib/profile";
import { t, type Lang } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import {
  HeaderNavRoot,
  HeaderNavLinks,
  HeaderNavTrigger,
  type NavItem,
} from "@/components/HeaderNav";

export function Header({ lang }: { lang: Lang }) {
  const items: NavItem[] = [
    { href: "/#about", id: "about", label: t("nav.about", lang) },
    { href: "/#company", id: "company", label: t("nav.company", lang) },
    { href: "/#experience", id: "experience", label: t("nav.experience", lang) },
    { href: "/#projects", id: "projects", label: t("nav.projects", lang) },
    { href: "/#roadmap", id: "roadmap", label: t("nav.roadmap", lang) },
    { href: "/#contact", id: "contact", label: t("nav.contact", lang) },
  ];

  return (
    <HeaderNavRoot
      items={items}
      email={profile.email}
      ctaLabel={t("cta.hire", lang)}
      closeLabel={t("nav.close", lang)}
      menuLabel={t("nav.menu", lang)}
    >
      <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[var(--background)]/85 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/65">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-4">
          <Logo />
          <HeaderNavLinks />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LangToggle current={lang} />
            <a
              href={`mailto:${profile.email}`}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[var(--brand-accent)] text-white px-4 py-2 text-sm font-semibold shadow-[0_1px_6px_color-mix(in_oklab,var(--brand-accent)_30%,transparent)] hover:brightness-110 transition-all"
            >
              {t("cta.hire", lang)}
            </a>
            <HeaderNavTrigger />
          </div>
        </div>
      </header>
    </HeaderNavRoot>
  );
}
