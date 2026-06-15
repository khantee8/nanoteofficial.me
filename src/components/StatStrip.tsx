import { profile, roadmap, pick } from "@/lib/profile";
import type { Lang } from "@/lib/i18n";

type LStr = Record<Lang, string>;
type Stat = { value: string; label: LStr };

// Career start: first role at AIT (Oct 2016). Kept here so the strip stays truthful
// and self-updating without touching profile.ts.
const CAREER_START = new Date("2016-10-01");
const years = Math.floor(
  (Date.now() - CAREER_START.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
);

const stats: Stat[] = [
  {
    value: `${years}+`,
    label: { en: "Years in cyber & enterprise tech", th: "ปีในสายไซเบอร์และเทคโนโลยีองค์กร" },
  },
  {
    value: String(profile.certifications.length),
    label: { en: "Professional certifications", th: "ใบรับรองวิชาชีพ" },
  },
  {
    value: String(roadmap.length),
    label: { en: "AI product builds", th: "ผลงาน AI ที่สร้าง" },
  },
  {
    value: "MBA",
    label: { en: "NIDA — Finance & MIS", th: "NIDA — การเงินและ MIS" },
  },
];

export function StatStrip({ lang }: { lang: Lang }) {
  return (
    <dl
      className="hero-fade mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4"
      style={{ "--hero-d": "950ms" } as React.CSSProperties}
    >
      {stats.map((s, i) => (
        <div key={i} className="bg-[var(--surface)] px-5 py-5">
          <dt className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--brand-accent)]">
            {s.value}
          </dt>
          <dd className="mt-1 text-xs leading-snug text-[var(--muted)]">
            {pick(s.label, lang)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
