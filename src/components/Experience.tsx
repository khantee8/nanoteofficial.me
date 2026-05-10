import { profile, pick } from "@/lib/profile";
import type { Lang } from "@/lib/i18n";

export function Experience({ lang }: { lang: Lang }) {
  return (
    <ol className="relative border-l border-[var(--border)] ml-2">
      {profile.experience.map((exp, i) => (
        <li key={i} className="mb-10 ml-6">
          <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-[var(--accent)] ring-4 ring-[var(--background)]" />
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="text-lg font-semibold">
              {pick(exp.role, lang)}
              <span className="text-[var(--muted)] font-normal">
                {" "}
                — {pick(exp.company, lang)}
              </span>
            </h3>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {pick(exp.period, lang)}
            </p>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-[var(--muted)]">
            {exp.bullets.map((b, j) => (
              <li key={j} className="flex gap-2">
                <span aria-hidden className="text-[var(--accent)]">•</span>
                <span>{pick(b, lang)}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
