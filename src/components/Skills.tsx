import { profile, pick } from "@/lib/profile";
import type { Lang } from "@/lib/i18n";

export function Skills({ lang }: { lang: Lang }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <ul className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {profile.personality.items.map((it, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm"
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            <span>{pick(it, lang)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
