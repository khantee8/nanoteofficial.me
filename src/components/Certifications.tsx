import { profile, pick } from "@/lib/profile";
import type { Lang } from "@/lib/i18n";

export function Certifications({ lang }: { lang: Lang }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {profile.certifications.map((c) => (
          <span
            key={c}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium tracking-tight"
          >
            {c}
          </span>
        ))}
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-xs uppercase tracking-[0.18em] font-mono text-[var(--muted-soft)] mb-3">
          {lang === "th" ? "รางวัล / กิจกรรม" : "Awards & activities"}
        </p>
        <ul className="space-y-1.5 text-sm">
          {profile.awards.map((a, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="text-[var(--accent)]">•</span>
              <span>{pick(a, lang)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
