import type { Metadata } from "next";
import { roadmap, pick } from "@/lib/profile";
import { getLang, t } from "@/lib/i18n";
import { SubdomainHero, FeatureGrid } from "@/components/SubdomainHero";

const item = roadmap.find((r) => r.key === "kb")!;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: `${pick(item.title, lang)} — ${pick(item.tagline, lang)}`,
    description: pick(item.description, lang),
    robots: { index: false, follow: false },
  };
}

export default async function KbPage() {
  const lang = await getLang();
  return (
    <>
      <SubdomainHero item={item} lang={lang} />
      <section className="mx-auto max-w-md px-6 pb-12">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
            {t("kb.private", lang)}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{t("kb.signin", lang)}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{t("kb.signinHint", lang)}</p>
          <form className="mt-5 space-y-3" action="#" aria-label={t("kb.signin", lang)}>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{t("kb.email", lang)}</span>
              <input
                type="email"
                disabled
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm disabled:opacity-50"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">{t("kb.password", lang)}</span>
              <input
                type="password"
                disabled
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm disabled:opacity-50"
              />
            </label>
            <button
              type="button"
              disabled
              className="w-full rounded-lg bg-[var(--foreground)] text-[var(--background)] px-4 py-2 text-sm font-medium opacity-50 cursor-not-allowed"
            >
              {t("kb.disabled", lang)}
            </button>
          </form>
        </div>
      </section>
      <FeatureGrid features={item.features} lang={lang} />
    </>
  );
}
