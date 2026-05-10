import type { Metadata } from "next";
import { roadmap } from "@/lib/profile";
import {
  SubdomainHero,
  FeatureGrid,
  ComingSoonCTA,
} from "@/components/SubdomainHero";

const item = roadmap.find((r) => r.key === "finance")!;

export const metadata: Metadata = {
  title: `${item.title} — ${item.tagline}`,
  description: item.description,
};

export default function FinancePage() {
  return (
    <>
      <SubdomainHero item={item} />
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { label: "Holdings", value: "—", hint: "live portfolio sync" },
            { label: "Risk score", value: "—", hint: "volatility & concentration" },
            { label: "Daily P/L", value: "—", hint: "vs cost basis" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 p-5"
            >
              <p className="text-xs uppercase tracking-[0.16em] font-mono text-[var(--muted)]">
                {s.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">{s.hint}</p>
            </div>
          ))}
        </div>
      </section>
      <FeatureGrid features={item.features} />
      <ComingSoonCTA subdomain={item.subdomain} />
    </>
  );
}
