import type { Metadata } from "next";
import { roadmap, pick } from "@/lib/profile";
import { getLang, t } from "@/lib/i18n";
import { SubdomainHero, FeatureGrid } from "@/components/SubdomainHero";

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
  return (
    <div data-feature="finance">
      <SubdomainHero item={item} lang={lang} />

      {/* Prototype phase CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-10">
        <div
          className="rounded-2xl border border-dashed p-8 md:p-10 text-center"
          style={{
            borderColor: "color-mix(in oklab, var(--feature-color) 40%, var(--border))",
            background: "var(--feature-tint)",
          }}
        >
          <p
            className="font-mono text-xs uppercase tracking-[0.18em] inline-flex items-center gap-2"
            style={{ color: "var(--feature-color-strong)" }}
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ background: "var(--feature-color)" }}
            />
            {t("subdomain.inPrototype", lang)}
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">
            {item.subdomain}
          </h3>
          <p className="mt-2 max-w-xl mx-auto text-[var(--muted)] text-sm leading-relaxed">
            {t("subdomain.prototypeDescription", lang)}
          </p>
        </div>
      </section>

      <FeatureGrid features={item.features} lang={lang} />
    </div>
  );
}
