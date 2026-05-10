import type { Metadata } from "next";
import { roadmap } from "@/lib/profile";
import {
  SubdomainHero,
  FeatureGrid,
  ComingSoonCTA,
} from "@/components/SubdomainHero";

const item = roadmap.find((r) => r.key === "cyber")!;

export const metadata: Metadata = {
  title: `${item.title} — ${item.tagline}`,
  description: item.description,
};

const sampleFeed = [
  { sev: "Critical", title: "Sample CVE-XXXX-XXXX placeholder advisory", time: "2m ago" },
  { sev: "High", title: "Vendor X advisory rolled into industry feed", time: "18m ago" },
  { sev: "Medium", title: "Phishing campaign targeting SEA finance sector", time: "1h ago" },
];

const sevColor: Record<string, string> = {
  Critical: "text-rose-500 border-rose-500/40 bg-rose-500/10",
  High: "text-amber-500 border-amber-500/40 bg-amber-500/10",
  Medium: "text-sky-500 border-sky-500/40 bg-sky-500/10",
};

export default function CyberPage() {
  return (
    <>
      <SubdomainHero item={item} />
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <h2 className="text-sm uppercase tracking-[0.18em] text-[var(--accent)] font-mono mb-4">
          Live feed (preview)
        </h2>
        <ul className="rounded-xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
          {sampleFeed.map((f) => (
            <li key={f.title} className="flex items-center gap-4 p-4 bg-[var(--surface)]/40">
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-mono uppercase tracking-wider ${sevColor[f.sev]}`}
              >
                {f.sev}
              </span>
              <p className="flex-1 text-sm">{f.title}</p>
              <span className="font-mono text-xs text-[var(--muted)]">{f.time}</span>
            </li>
          ))}
        </ul>
      </section>
      <FeatureGrid features={item.features} />
      <ComingSoonCTA subdomain={item.subdomain} />
    </>
  );
}
