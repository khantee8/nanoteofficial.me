import type { Metadata } from "next";
import { roadmap, pick } from "@/lib/profile";
import { getLang } from "@/lib/i18n";
import {
  SubdomainHero,
  FeatureGrid,
  ComingSoonCTA,
} from "@/components/SubdomainHero";

const item = roadmap.find((r) => r.key === "art")!;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: `${pick(item.title, lang)} — ${pick(item.tagline, lang)}`,
    description: pick(item.description, lang),
  };
}

export default async function ArtPage() {
  const lang = await getLang();
  return (
    <>
      <SubdomainHero item={item} lang={lang} />
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl border border-[var(--border)] bg-gradient-to-br from-rose-500/10 via-fuchsia-500/10 to-amber-500/10 flex items-center justify-center text-xs font-mono text-[var(--muted)]"
            >
              {String(i + 1).padStart(2, "0")}
            </div>
          ))}
        </div>
      </section>
      <FeatureGrid features={item.features} lang={lang} />
      <ComingSoonCTA subdomain={item.subdomain} lang={lang} />
    </>
  );
}
