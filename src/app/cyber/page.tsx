import type { Metadata } from "next";
import { roadmap, pick } from "@/lib/profile";
import { getLang, t, type Lang } from "@/lib/i18n";
import {
  SubdomainHero,
  FeatureGrid,
  ComingSoonCTA,
} from "@/components/SubdomainHero";

const item = roadmap.find((r) => r.key === "cyber")!;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: `${pick(item.title, lang)} — ${pick(item.tagline, lang)}`,
    description: pick(item.description, lang),
  };
}

const sevColor: Record<string, string> = {
  Critical: "text-rose-700 border-rose-300 bg-rose-50 dark:text-rose-300 dark:border-rose-500/40 dark:bg-rose-500/10",
  High: "text-amber-700 border-amber-300 bg-amber-50 dark:text-amber-300 dark:border-amber-500/40 dark:bg-amber-500/10",
  Medium: "text-sky-700 border-sky-300 bg-sky-50 dark:text-sky-300 dark:border-sky-500/40 dark:bg-sky-500/10",
};

const feedItems: { sev: keyof typeof sevColor; title: Record<Lang, string>; time: string }[] = [
  {
    sev: "Critical",
    title: {
      en: "Sample CVE-XXXX-XXXX placeholder advisory",
      th: "ตัวอย่างคำแนะนำ CVE-XXXX-XXXX",
    },
    time: "2m",
  },
  {
    sev: "High",
    title: {
      en: "Vendor X advisory rolled into industry feed",
      th: "คำแนะนำจาก Vendor X รวมเข้าฟีดอุตสาหกรรม",
    },
    time: "18m",
  },
  {
    sev: "Medium",
    title: {
      en: "Phishing campaign targeting SEA finance sector",
      th: "แคมเปญฟิชชิ่งเล็งกลุ่มการเงินในเอเชียตะวันออกเฉียงใต้",
    },
    time: "1h",
  },
];

export default async function CyberPage() {
  const lang = await getLang();
  return (
    <>
      <SubdomainHero item={item} lang={lang} />
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <h2 className="text-sm uppercase tracking-[0.18em] text-[var(--accent)] font-mono mb-4">
          {t("subdomain.liveFeed", lang)}
        </h2>
        <ul className="rounded-xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
          {feedItems.map((f, i) => (
            <li key={i} className="flex items-center gap-4 p-4 bg-[var(--surface)]">
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-mono uppercase tracking-wider ${sevColor[f.sev]}`}
              >
                {f.sev}
              </span>
              <p className="flex-1 text-sm">{f.title[lang]}</p>
              <span className="font-mono text-xs text-[var(--muted)]">{f.time}</span>
            </li>
          ))}
        </ul>
      </section>
      <FeatureGrid features={item.features} lang={lang} />
      <ComingSoonCTA subdomain={item.subdomain} lang={lang} />
    </>
  );
}
