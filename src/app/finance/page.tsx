import type { Metadata } from "next";
import { roadmap, pick } from "@/lib/profile";
import { getLang, t } from "@/lib/i18n";
import {
  SubdomainHero,
  FeatureGrid,
  ComingSoonCTA,
} from "@/components/SubdomainHero";

const item = roadmap.find((r) => r.key === "finance")!;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: `${pick(item.title, lang)} — ${pick(item.tagline, lang)}`,
    description: pick(item.description, lang),
  };
}

export default async function FinancePage() {
  const lang = await getLang();
  const stats = [
    { label: t("subdomain.holdings", lang), hint: t("subdomain.holdingsHint", lang) },
    { label: t("subdomain.risk", lang), hint: t("subdomain.riskHint", lang) },
    { label: t("subdomain.pnl", lang), hint: t("subdomain.pnlHint", lang) },
  ];
  return (
    <div data-feature="finance">
      <SubdomainHero item={item} lang={lang} />
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="grid gap-5 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 relative overflow-hidden"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5"
                style={{ background: "var(--feature-color)" }}
              />
              <p className="text-xs uppercase tracking-[0.16em] font-mono text-[var(--muted)]">
                {s.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">—</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{s.hint}</p>
            </div>
          ))}
        </div>
      </section>
      <FeatureGrid features={item.features} lang={lang} />
      <ComingSoonCTA subdomain={item.subdomain} lang={lang} />
    </div>
  );
}
