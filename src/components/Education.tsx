import { profile, pick } from "@/lib/profile";
import type { Lang } from "@/lib/i18n";

export function Education({ lang }: { lang: Lang }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {profile.education.map((ed, i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted-soft)]">
            {ed.period} {ed.gpa ? `· GPA ${ed.gpa}` : ""}
          </p>
          <h3 className="mt-2 text-base font-semibold leading-snug">
            {pick(ed.degree, lang)}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{pick(ed.school, lang)}</p>
          {ed.notes && (
            <ul className="mt-3 space-y-1 text-xs text-[var(--muted)]">
              {ed.notes.map((n, j) => (
                <li key={j} className="flex gap-2">
                  <span aria-hidden className="text-[var(--accent)]">•</span>
                  <span>{pick(n, lang)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
