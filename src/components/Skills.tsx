import { profile } from "@/lib/profile";

export function Skills() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {profile.skills.map((s) => (
        <div
          key={s.group}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 p-5"
        >
          <h3 className="text-sm font-semibold tracking-tight">{s.group}</h3>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {s.items.map((it) => (
              <li
                key={it}
                className="rounded-full border border-[var(--border)] bg-[var(--background)]/50 px-2.5 py-1 text-xs text-[var(--muted)]"
              >
                {it}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
