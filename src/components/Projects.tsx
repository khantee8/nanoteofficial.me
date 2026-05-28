import { profile, pick } from "@/lib/profile";
import type { Lang } from "@/lib/i18n";

export function Projects({ lang }: { lang: Lang }) {
  return (
    <div className="space-y-6">
      {profile.projects.map((p, i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 card-hover"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
            <h3 className="text-base font-semibold">{pick(p.role, lang)}</h3>
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {p.period}
            </span>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {p.clients.map((c, j) => (
              <li
                key={j}
                className="flex gap-2 text-sm text-[var(--muted)] leading-snug"
              >
                <span aria-hidden className="text-[var(--accent)] mt-0.5">•</span>
                <span>{pick(c, lang)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
