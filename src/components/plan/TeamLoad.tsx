import { DEFAULT_CAPACITY_HOURS, userLabel } from "@/lib/plan/types";
import type { TeamLoadRow } from "@/lib/plan/types";

export function TeamLoad({ rows }: { rows: TeamLoadRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-soft)]">
        No open tasks across active projects. Assign tasks (with hour estimates)
        to see capacity vs. allocation here.
      </p>
    );
  }

  const cap = DEFAULT_CAPACITY_HOURS;
  const maxHours = Math.max(cap, ...rows.map((r) => r.openHours));

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--muted-soft)]">
        Open (non-done) work across active projects. Bars compare allocated hours
        to an assumed {cap}h capacity per person.
      </p>
      {rows.map((r) => {
        const label = r.assigneeId ? userLabel(r) : "Unassigned";
        const pct = Math.min(100, (r.openHours / maxHours) * 100);
        const over = r.openHours > cap && r.assigneeId != null;
        return (
          <div key={r.assigneeId ?? "unassigned"} className="text-sm">
            <div className="mb-1.5 flex items-center justify-between">
              <span className={r.assigneeId ? "font-medium" : "italic text-[var(--muted-soft)]"}>{label}</span>
              <span className="text-xs text-[var(--muted-soft)]">
                <span className="tabular-nums">{r.openHours > 0 ? `${round(r.openHours)}h` : "—"}</span> · {r.openCount} task{r.openCount === 1 ? "" : "s"}
                {over && <span className="ml-1.5 font-medium text-rose-500">over capacity</span>}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div className="h-full rounded-full transition-[width] duration-500" style={{
                width: `${pct}%`,
                background: over ? "#f43f5e" : "var(--feature-color)",
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
