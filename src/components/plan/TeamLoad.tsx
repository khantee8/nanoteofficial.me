import { DEFAULT_CAPACITY_HOURS, userLabel } from "@/lib/plan/types";
import type { TeamLoadRow } from "@/lib/plan/types";

export function TeamLoad({ rows }: { rows: TeamLoadRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-black/10 p-6 text-sm opacity-60 dark:border-white/10">
        No open tasks across active projects. Assign tasks (with hour estimates)
        to see capacity vs. allocation here.
      </div>
    );
  }

  const cap = DEFAULT_CAPACITY_HOURS;
  const maxHours = Math.max(cap, ...rows.map((r) => r.openHours));

  return (
    <div className="space-y-3">
      <p className="text-xs opacity-60">
        Open (non-done) work across active projects. Bars compare allocated hours
        to an assumed {cap}h capacity per person.
      </p>
      {rows.map((r) => {
        const label = r.assigneeId ? userLabel(r) : "Unassigned";
        const pct = Math.min(100, (r.openHours / maxHours) * 100);
        const over = r.openHours > cap && r.assigneeId != null;
        return (
          <div key={r.assigneeId ?? "unassigned"} className="text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className={r.assigneeId ? "" : "italic opacity-60"}>{label}</span>
              <span className="text-xs opacity-60">
                {r.openHours > 0 ? `${round(r.openHours)}h` : "—"} · {r.openCount} task{r.openCount === 1 ? "" : "s"}
                {over && <span className="ml-1 font-medium text-red-500">over capacity</span>}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-black/5 dark:bg-white/10">
              <div className="h-full rounded" style={{
                width: `${pct}%`,
                background: over ? "var(--color-red-500, #ef4444)" : "var(--feature-color)",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}
