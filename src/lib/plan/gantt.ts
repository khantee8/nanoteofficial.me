import type { Task } from "@/lib/db/schema";

export type GanttBar = { task: Task; startIdx: number; span: number; overdue: boolean };
export type GanttMonth = { label: string; startIdx: number };
export type GanttData = {
  days: number;
  bars: GanttBar[];
  unscheduled: Task[];
  todayIdx: number | null;
  weeks: number[];
  months: GanttMonth[];
};

const DAY = 86_400_000;
const toUtc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const isoToday = () => new Date().toISOString().slice(0, 10);

/** Pure window math for the Gantt view — all dates are ISO `date` columns,
 *  compared in UTC so the chart is timezone-stable. */
export function computeGantt(
  tasks: Task[],
  opts?: { todayIso?: string; locale?: string },
): GanttData {
  const locale = opts?.locale ?? "en-GB";
  const today = toUtc(opts?.todayIso ?? isoToday());
  const dated = tasks.filter((t) => t.startDate || t.dueDate);
  const unscheduled = tasks.filter((t) => !t.startDate && !t.dueDate);
  if (dated.length === 0) {
    return { days: 0, bars: [], unscheduled, todayIdx: null, weeks: [], months: [] };
  }

  const startOf = (t: Task) => toUtc((t.startDate ?? t.dueDate)!);
  const endOf = (t: Task) => toUtc((t.dueDate ?? t.startDate)!);

  let min = Math.min(...dated.flatMap((t) => [startOf(t), endOf(t)]));
  let max = Math.max(...dated.flatMap((t) => [startOf(t), endOf(t)]));
  min -= 3 * DAY;
  max += 3 * DAY;
  // Pull today into view when it's near the task window (keeps the marker useful
  // without stretching the chart for far-past/future projects).
  if (today >= min - 7 * DAY && today <= max + 7 * DAY) {
    min = Math.min(min, today - DAY);
    max = Math.max(max, today + DAY);
  }

  const days = Math.round((max - min) / DAY) + 1;

  const bars: GanttBar[] = dated
    .map((task) => {
      const s = Math.min(startOf(task), endOf(task)); // tolerate start > due
      const e = Math.max(startOf(task), endOf(task));
      return {
        task,
        startIdx: Math.round((s - min) / DAY),
        span: Math.round((e - s) / DAY) + 1,
        overdue: task.status !== "done" && !!task.dueDate && toUtc(task.dueDate) < today,
      };
    })
    .sort((a, b) => a.startIdx - b.startIdx || a.span - b.span);

  const todayIdx = today >= min && today <= max ? Math.round((today - min) / DAY) : null;

  const weeks: number[] = [];
  const months: GanttMonth[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(min + i * DAY);
    if (d.getUTCDay() === 1) weeks.push(i);
    if (d.getUTCDate() === 1 || i === 0) {
      months.push({
        label: d.toLocaleDateString(locale, { month: "short", year: "numeric", timeZone: "UTC" }),
        startIdx: i,
      });
    }
  }
  // The forced window-start label overlaps the first real month boundary when
  // the window opens near a month's end — drop it if the boundary is too close.
  if (months.length >= 2 && months[1].startIdx - months[0].startIdx < Math.max(7, Math.round(days * 0.08))) {
    months.shift();
  }
  return { days, bars, unscheduled, todayIdx, weeks, months };
}
