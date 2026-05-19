import Link from "next/link";
import { profile, pick } from "@/lib/profile";
import { t, type Lang } from "@/lib/i18n";
import { Avatar } from "@/components/Avatar";

export function Hero({ lang }: { lang: Lang }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.35]" />
      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="flex flex-col-reverse md:flex-row md:items-start md:gap-12 lg:gap-16">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent)] mb-5">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {pick(profile.location, lang)} &middot; {t("hero.available", lang)}
              </span>
            </p>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
              {pick(profile.name, lang)}.
              <span className="block text-[var(--muted)] mt-2 text-2xl md:text-3xl font-medium">
                {pick(profile.headline, lang)}.
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-[var(--muted)] leading-relaxed">
              {pick(profile.summary, lang)}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/#roadmap"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-accent)] text-white px-5 py-2.5 text-sm font-semibold shadow-[0_2px_10px_color-mix(in_oklab,var(--brand-accent)_30%,transparent)] hover:brightness-110 transition-all"
              >
                {t("cta.roadmap", lang)}
                <span aria-hidden>→</span>
              </Link>
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] px-5 py-2.5 text-sm font-medium hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-colors"
              >
                {t("cta.contact", lang)}
              </a>
            </div>
          </div>
          <div className="mb-8 md:mb-0 md:pt-2">
            <Avatar size={220} lang={lang} />
          </div>
        </div>
      </div>
    </section>
  );
}
