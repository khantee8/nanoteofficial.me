import type { Metadata } from "next";
import { roadmap } from "@/lib/profile";
import {
  SubdomainHero,
  FeatureGrid,
  ComingSoonCTA,
} from "@/components/SubdomainHero";

const item = roadmap.find((r) => r.key === "art")!;

export const metadata: Metadata = {
  title: `${item.title} — ${item.tagline}`,
  description: item.description,
};

export default function ArtPage() {
  return (
    <>
      <SubdomainHero item={item} />
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl border border-[var(--border)] bg-gradient-to-br from-rose-500/10 via-fuchsia-500/10 to-amber-500/10 flex items-center justify-center text-xs font-mono text-[var(--muted)]"
            >
              piece {String(i + 1).padStart(2, "0")}
            </div>
          ))}
        </div>
      </section>
      <FeatureGrid features={item.features} />
      <ComingSoonCTA subdomain={item.subdomain} />
    </>
  );
}
