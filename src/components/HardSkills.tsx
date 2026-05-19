import { profile, pick } from "@/lib/profile";
import type { Lang } from "@/lib/i18n";

export function HardSkills({ lang }: { lang: Lang }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {profile.hardSkills.map((s, i) => (
        <div
          key={i}
          className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 flex items-center gap-3 transition-colors hover:border-[color-mix(in_oklab,var(--accent)_40%,var(--border))]"
        >
          <span
            aria-hidden
            className="shrink-0 h-2 w-2 rounded-full bg-[var(--accent)] opacity-70 group-hover:opacity-100 transition-opacity"
          />
          <span className="text-sm font-medium leading-snug">{pick(s, lang)}</span>
        </div>
      ))}
    </div>
  );
}
