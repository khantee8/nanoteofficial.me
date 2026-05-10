import { profile } from "@/lib/profile";

export function Experience() {
  return (
    <ol className="relative border-l border-[var(--border)] ml-2">
      {profile.experience.map((exp) => (
        <li key={`${exp.role}-${exp.company}`} className="mb-10 ml-6">
          <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-[var(--accent)] ring-4 ring-[var(--background)]" />
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className="text-lg font-semibold">
              {exp.role} <span className="text-[var(--muted)] font-normal">— {exp.company}</span>
            </h3>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {exp.period}
            </p>
          </div>
          {exp.location && (
            <p className="text-sm text-[var(--muted)]">{exp.location}</p>
          )}
          <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-[var(--muted)]">
            {exp.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span aria-hidden className="text-[var(--accent)]">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
