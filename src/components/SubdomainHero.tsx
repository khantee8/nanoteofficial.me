import Link from "next/link";
import { pick, type RoadmapItem } from "@/lib/profile";
import { t, type Lang } from "@/lib/i18n";

export function SubdomainHero({
  item,
  lang,
}: {
  item: RoadmapItem;
  lang: Lang;
}) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.3]" />
      <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 md:pt-28">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <span aria-hidden>←</span> {t("cta.back", lang)}
        </Link>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
          {item.subdomain}
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
          {pick(item.title, lang)}.
        </h1>
        <p className="mt-3 text-xl text-[var(--muted)]">{pick(item.tagline, lang)}</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          {t("subdomain.status", lang)} {t(`status.${item.status}` as const, lang)}
        </div>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed">
          {pick(item.description, lang)}
        </p>
      </div>
    </section>
  );
}

export function FeatureGrid({
  features,
  lang,
}: {
  features: RoadmapItem["features"];
  lang: Lang;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-20">
      <h2 className="text-sm uppercase tracking-[0.18em] text-[var(--accent)] font-mono mb-6">
        {t("subdomain.plannedFeatures", lang)}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((f, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 flex gap-4"
          >
            <span className="font-mono text-xs text-[var(--muted)] mt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="leading-relaxed">{pick(f, lang)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ComingSoonCTA({
  subdomain,
  lang,
}: {
  subdomain: string;
  lang: Lang;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24">
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 md:p-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          {t("subdomain.preview", lang)}
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight">
          {t("subdomain.comingTo", lang)} {subdomain}
        </h3>
        <p className="mt-2 max-w-xl mx-auto text-[var(--muted)]">
          {t("subdomain.comingDescription", lang)}
        </p>
      </div>
    </div>
  );
}
