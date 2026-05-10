import Link from "next/link";
import { roadmap, type RoadmapItem } from "@/lib/profile";

const statusStyles: Record<RoadmapItem["status"], string> = {
  Planned:
    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  "In design":
    "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30",
  Prototyping:
    "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  Live: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/40",
};

export function Roadmap() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {roadmap.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_4px_24px_rgba(15,23,42,0.06)]`}
        >
          <div
            aria-hidden
            className={`pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br ${item.accent} opacity-70 blur-2xl`}
          />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted-soft)]">
                {item.subdomain}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.tagline}</p>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${statusStyles[item.status]}`}
            >
              {item.status}
            </span>
          </div>
          <p className="relative mt-5 text-sm leading-relaxed">{item.description}</p>
          <ul className="relative mt-5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-[var(--muted)]">
            {item.features.map((f) => (
              <li key={f} className="flex gap-2">
                <span aria-hidden className="text-[var(--accent)] font-bold">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)]">
            Explore preview
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
