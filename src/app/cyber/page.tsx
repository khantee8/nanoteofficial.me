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

const feedItems: { sev: keyof typeof sevColor; title: Record<Lang, string>; time: string; cve?: string; vendor?: string }[] = [
  {
    sev: "Critical",
    title: {
      en: "Remote code execution in enterprise firewall management plane",
      th: "ช่องโหว่ Remote Code Execution ใน Management Plane ของ Firewall องค์กร",
    },
    time: "2m",
    cve: "CVE-2025-0282",
    vendor: "Ivanti",
  },
  {
    sev: "Critical",
    title: {
      en: "Authentication bypass in zero-trust network gateway",
      th: "ช่องโหว่ Authentication Bypass ใน Zero-Trust Gateway",
    },
    time: "14m",
    cve: "CVE-2025-23209",
    vendor: "Palo Alto",
  },
  {
    sev: "High",
    title: {
      en: "Privilege escalation via LDAP injection in IAM platform",
      th: "ยกระดับสิทธิ์ผ่าน LDAP Injection ใน IAM Platform",
    },
    time: "42m",
    cve: "CVE-2025-21298",
    vendor: "Microsoft",
  },
  {
    sev: "High",
    title: {
      en: "Vendor advisory: FortiOS SSL-VPN pre-auth buffer overflow",
      th: "คำแนะนำจาก Vendor: FortiOS SSL-VPN Buffer Overflow ก่อน Authentication",
    },
    time: "1h",
    cve: "CVE-2024-55591",
    vendor: "Fortinet",
  },
  {
    sev: "Medium",
    title: {
      en: "Phishing campaign targeting SEA finance sector via deepfake voice",
      th: "แคมเปญฟิชชิ่งใช้ Deepfake เสียงเล็งกลุ่มการเงินในเอเชียตะวันออกเฉียงใต้",
    },
    time: "2h",
  },
  {
    sev: "High",
    title: {
      en: "SIEM log ingestion bypass via crafted syslog headers",
      th: "ข้ามการรับ Log ของ SIEM ผ่าน Syslog Header ที่ถูกดัดแปลง",
    },
    time: "3h",
    cve: "CVE-2025-1094",
    vendor: "Splunk",
  },
  {
    sev: "Medium",
    title: {
      en: "Misconfigured cloud IAM roles expose government S3 buckets",
      th: "การตั้งค่า IAM ผิดพลาดเปิดเผย S3 Bucket ของหน่วยงานรัฐ",
    },
    time: "5h",
  },
];

export default async function CyberPage() {
  const lang = await getLang();
  return (
    <div data-feature="cyber">
      <SubdomainHero item={item} lang={lang} />
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm uppercase tracking-[0.18em] text-[var(--accent)] font-mono">
            {t("subdomain.liveFeed", lang)}
          </h2>
          <div className="flex items-center gap-6 text-xs font-mono text-[var(--muted)]">
            <span>
              <span className="text-[var(--foreground)] font-semibold">{feedItems.length}</span>{" "}
              {t("subdomain.threatsToday", lang)}
            </span>
            <span>
              <span className="text-rose-500 font-semibold">{feedItems.filter((f) => f.sev === "Critical").length}</span>{" "}
              {t("subdomain.criticalCount", lang)}
            </span>
            <span className="hidden sm:inline">
              {t("subdomain.lastUpdated", lang)}{" "}
              <span className="text-[var(--foreground)]">2m ago</span>
            </span>
          </div>
        </div>
        <ul className="rounded-xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
          {feedItems.map((f, i) => (
            <li key={i} className="flex items-center gap-4 p-4 bg-[var(--surface)]">
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-mono uppercase tracking-wider ${sevColor[f.sev]}`}
              >
                {f.sev}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{f.title[lang]}</p>
                {(f.cve || f.vendor) && (
                  <p className="text-[11px] font-mono text-[var(--muted-soft)] mt-0.5">
                    {f.cve && <span className="mr-3">{f.cve}</span>}
                    {f.vendor && <span>{f.vendor}</span>}
                  </p>
                )}
              </div>
              <span className="shrink-0 font-mono text-xs text-[var(--muted)]">{f.time}</span>
            </li>
          ))}
        </ul>
      </section>
      <FeatureGrid features={item.features} lang={lang} />
      <ComingSoonCTA subdomain={item.subdomain} lang={lang} />
    </div>
  );
}
