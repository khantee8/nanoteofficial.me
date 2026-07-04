import { DEFAULT_CAPACITY_HOURS, userLabel } from "@/lib/plan/types";
import type { TeamLoadRow } from "@/lib/plan/types";
import { WORKDAY_HOURS, workdaysBetween } from "@/lib/plan/dates";
import type { Lang } from "@/lib/i18n";
import { pt } from "@/lib/plan/i18n";

export function TeamLoad({ rows, lang }: { rows: TeamLoadRow[]; lang: Lang }) {
  if (rows.length === 0) {
    return <p className="text-sm text-[var(--muted-soft)]">{pt(lang, "tl.empty")}</p>;
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  // Capacity = workdays left until the person's furthest due date × 8h.
  // All overdue → one day's worth; no dated open tasks → weekly baseline.
  const capacityOf = (r: TeamLoadRow) => {
    if (!r.maxDue) return DEFAULT_CAPACITY_HOURS;
    if (r.maxDue < todayIso) return WORKDAY_HOURS;
    return Math.max(1, workdaysBetween(todayIso, r.maxDue)) * WORKDAY_HOURS;
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--muted-soft)]">{pt(lang, "tl.desc", { cap: DEFAULT_CAPACITY_HOURS })}</p>
      {rows.map((r) => {
        const label = r.assigneeId ? userLabel(r) : pt(lang, "tl.unassigned");
        const capacity = capacityOf(r);
        const pct = Math.min(100, (r.openHours / capacity) * 100);
        const over = r.openHours > capacity && r.assigneeId != null;
        const taskWord = lang === "en" && r.openCount === 1 ? "task" : pt(lang, "tl.tasks");
        return (
          <div key={r.assigneeId ?? "unassigned"} className="text-sm">
            <div className="mb-1.5 flex items-center justify-between">
              <span className={r.assigneeId ? "font-medium" : "italic text-[var(--muted-soft)]"}>{label}</span>
              <span className="text-xs text-[var(--muted-soft)]">
                <span className="tabular-nums">
                  {r.openHours > 0 ? `${round(r.openHours)}h / ${round(capacity)}h` : "—"}
                </span> · {r.openCount} {taskWord}
                {over && <span className="ml-1.5 font-medium text-rose-500">{pt(lang, "tl.over")}</span>}
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
