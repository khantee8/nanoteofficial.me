import Link from "next/link";
import type { ProjectWithProgress } from "@/lib/plan/types";
import { TypeBadge, ProgressBar, CalendarIcon } from "./ui";

export function ProjectCard({ p }: { p: ProjectWithProgress }) {
  return (
    <Link href={`/plan/${p.id}`}
      className="group flex min-h-32 flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition duration-150 hover:border-[color-mix(in_srgb,var(--feature-color)_40%,var(--border))] hover:shadow-md motion-safe:hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feature-color)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium tracking-tight transition group-hover:text-[var(--feature-color)]">{p.name}</h3>
        <TypeBadge type={p.type} color={p.color} />
      </div>

      <div className="mt-auto space-y-1.5">
        <ProgressBar value={p.progress} color={p.color} />
        <div className="flex items-center justify-between text-xs text-[var(--muted-soft)]">
          <span>{p.done}/{p.total} done · {p.progress}%</span>
          {p.targetDate && (
            <span className="inline-flex items-center gap-1"><CalendarIcon /> {p.targetDate}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
