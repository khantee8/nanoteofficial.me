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
      <div aria-hidden className="absolute inset-0 feature-glow" />
      <div aria-hidden className="absolute inset-0 bg-grid opacity-25" />
      <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 md:pt-28">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <span aria-hidden>←</span> {t("cta.back", lang)}
        </Link>
        <p
          className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]"
          style={{ color: "var(--feature-color-strong)" }}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ background: "var(--feature-color)" }}
          />
          {item.subdomain}
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
          {pick(item.title, lang)}
          <span style={{ color: "var(--feature-color)" }}>.</span>
        </h1>
        <p className="mt-3 text-xl text-[var(--muted)]">{pick(item.tagline, lang)}</p>
        <div
          className="mt-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
          style={{
            borderColor: "color-mix(in oklab, var(--feature-color) 40%, transparent)",
            background: "var(--feature-tint)",
            color: "var(--feature-color-strong)",
          }}
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--feature-color)" }} />
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
      <h2
        className="text-sm uppercase tracking-[0.18em] font-mono mb-6"
        style={{ color: "var(--feature-color-strong)" }}
      >
        {t("subdomain.plannedFeatures", lang)}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((f, i) => (
          <div
            key={i}
            className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 flex gap-4 transition-colors hover:border-[var(--feature-color-strong)]"
          >
            <span
              className="font-mono text-xs mt-0.5 tabular-nums font-semibold"
              style={{ color: "var(--feature-color-strong)" }}
            >
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
      <div
        className="rounded-2xl border border-dashed p-8 md:p-10 text-center"
        style={{
          borderColor: "color-mix(in oklab, var(--feature-color) 35%, var(--border))",
          background: "var(--feature-tint)",
        }}
      >
        <p
          className="font-mono text-xs uppercase tracking-[0.18em]"
          style={{ color: "var(--feature-color-strong)" }}
        >
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
