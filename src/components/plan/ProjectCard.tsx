import Link from "next/link";
import type { ProjectWithProgress } from "@/lib/plan/types";

export function ProjectCard({ p }: { p: ProjectWithProgress }) {
  return (
    <Link href={`/plan/${p.id}`}
      className="block rounded-lg border border-black/10 p-4 transition hover:shadow-md dark:border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{p.name}</h3>
        <span className="rounded-full px-2 py-0.5 text-xs"
          style={{ background: `${p.color}22`, color: p.color }}>{p.type}</span>
      </div>
      {p.targetDate && <p className="mt-1 text-xs opacity-60">Target: {p.targetDate}</p>}
      <div className="mt-3 h-2 w-full rounded-full bg-black/10 dark:bg-white/10">
        <div className="h-2 rounded-full" style={{ width: `${p.progress}%`, background: p.color }} />
      </div>
      <p className="mt-1 text-xs opacity-60">{p.done}/{p.total} done · {p.progress}%</p>
    </Link>
  );
}
