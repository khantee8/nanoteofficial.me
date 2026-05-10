import { profile, pick } from "@/lib/profile";
import type { Lang } from "@/lib/i18n";

export function HardSkills({ lang }: { lang: Lang }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {profile.hardSkills.map((s, i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <h3 className="text-sm font-semibold tracking-tight">{pick(s.label, lang)}</h3>
            <span className="font-mono text-xs tabular-nums text-[var(--muted)]">
              {s.pct}%
            </span>
          </div>
          <div
            className="h-2 rounded-full bg-[var(--surface-2)] overflow-hidden"
            role="progressbar"
            aria-valuenow={s.pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={pick(s.label, lang)}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[color-mix(in_oklab,var(--accent)_60%,white)]"
              style={{ width: `${s.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
