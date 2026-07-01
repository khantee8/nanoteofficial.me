import Link from "next/link";
import { profile, pick } from "@/lib/profile";
import { t, type Lang } from "@/lib/i18n";
import { Avatar } from "@/components/Avatar";
import { StatStrip } from "@/components/StatStrip";
import { ArrowRight } from "@/components/icons";

export function Hero({ lang }: { lang: Lang }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 feature-glow" />
      <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.35]" />
      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="flex flex-col-reverse md:flex-row md:items-start md:gap-12 lg:gap-16">
          <div className="flex-1 min-w-0">
            <p
              className="hero-up font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent)] mb-5"
              style={{ "--hero-d": "200ms" } as React.CSSProperties}
            >
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {pick(profile.location, lang)} &middot; {t("hero.available", lang)}
              </span>
            </p>
            <h1
              className="hero-up text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl"
              style={{ "--hero-d": "350ms" } as React.CSSProperties}
            >
              {pick(profile.name, lang)}.
              <span
                className="hero-up block text-[var(--muted)] mt-2 text-2xl md:text-3xl font-medium"
                style={{ "--hero-d": "500ms" } as React.CSSProperties}
              >
                {pick(profile.headline, lang)}.
              </span>
            </h1>
            <p
              className="hero-fade mt-8 max-w-2xl text-lg text-[var(--muted)] leading-relaxed"
              style={{ "--hero-d": "650ms" } as React.CSSProperties}
            >
              {pick(profile.summary, lang)}
            </p>
            <div
              className="hero-up mt-10 flex flex-wrap gap-3"
              style={{ "--hero-d": "800ms" } as React.CSSProperties}
            >
              <Link
                href="/#roadmap"
                className="group inline-flex items-center gap-2 rounded-full bg-[var(--brand-accent)] text-[var(--feature-contrast)] px-5 py-2.5 text-sm font-semibold shadow-[0_2px_10px_color-mix(in_oklab,var(--brand-accent)_30%,transparent)] hover:brightness-110 transition-all"
              >
                {t("cta.work", lang)}
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] px-5 py-2.5 text-sm font-medium hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-colors"
              >
                {t("cta.contact", lang)}
              </a>
            </div>
          </div>
          <div
            className="hero-scale mb-8 md:mb-0 md:pt-2"
            style={{ "--hero-d": "300ms" } as React.CSSProperties}
          >
            <Avatar size={220} lang={lang} />
          </div>
        </div>
        <StatStrip lang={lang} />
      </div>
    </section>
  );
}
