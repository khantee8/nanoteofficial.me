import type { StatusCount } from "@/lib/plan/types";
import type { Task } from "@/lib/db/schema";
import type { Lang } from "@/lib/i18n";
import { pt, statusKey } from "@/lib/plan/i18n";

const DOT: Record<Task["status"], string> = {
  backlog: "bg-slate-400",
  todo: "bg-blue-500",
  in_progress: "bg-amber-500",
  done: "bg-emerald-500",
};
const KEYS: Task["status"][] = ["backlog", "todo", "in_progress", "done"];

export function StatusOverview({ counts, lang }: { counts: StatusCount; lang: Lang }) {
  const total = KEYS.reduce((s, k) => s + counts[k], 0);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {KEYS.map((k) => (
        <div key={k} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
            <span className={`h-1.5 w-1.5 rounded-full ${DOT[k]}`} />
            {pt(lang, statusKey(k))}
          </div>
          <div className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">{counts[k]}</div>
          <div className="text-[11px] text-[var(--muted-soft)]">
            {total ? Math.round((counts[k] / total) * 100) : 0}%
          </div>
        </div>
      ))}
    </div>
  );
}
