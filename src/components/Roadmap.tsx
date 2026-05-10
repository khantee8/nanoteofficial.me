import Link from "next/link";
import { roadmap } from "@/lib/profile";

export function Roadmap() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {roadmap.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${item.accent} bg-[var(--surface)]/60 p-7 transition-all hover:-translate-y-0.5 hover:border-current/60`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                {item.subdomain}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.tagline}</p>
            </div>
            <span className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--background)]/60 px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
              {item.status}
            </span>
          </div>
          <p className="mt-5 text-sm leading-relaxed">{item.description}</p>
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-[var(--muted)]">
            {item.features.map((f) => (
              <li key={f} className="flex gap-2">
                <span aria-hidden className="text-[var(--accent)]">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium">
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
