import type { Project, Task } from "@/lib/db/schema";

export type BurndownPoint = { date: string; remaining: number; ideal: number };
export type Burndown = {
  points: BurndownPoint[];
  unit: "hours" | "tasks";
  total: number;
};

const DAY_MS = 86_400_000;
const MAX_POINTS = 60;
const dayIndex = (ms: number) => Math.floor(ms / DAY_MS);
const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Compute a burndown series on-the-fly from current task state — no snapshots.
 *
 * "Remaining work" at the end of a given day = total weight of tasks that
 * already exist (createdAt ≤ day) and are not yet done as of that day, where a
 * task counts as done from its `updatedAt` if its current status is "done".
 * Weight is each task's `estimateHours` when any estimates exist, else 1 (count).
 *
 * Approximation caveats (inherent to deriving history from current rows):
 * reopened or re-edited tasks shift their effective done date, and scope added
 * later isn't reflected before its createdAt. Good enough for a trend; not an
 * audit trail.
 */
export function computeBurndown(tasks: Task[], project: Project): Burndown {
  if (tasks.length === 0) return { points: [], unit: "tasks", total: 0 };

  const useHours = tasks.some(
    (t) => t.estimateHours != null && Number(t.estimateHours) > 0,
  );
  const unit: Burndown["unit"] = useHours ? "hours" : "tasks";
  const weight = (t: Task) => (useHours ? Number(t.estimateHours ?? 0) : 1);
  const total = round1(tasks.reduce((s, t) => s + weight(t), 0));

  const starts = tasks.map((t) => new Date(t.createdAt).getTime());
  if (project.startDate) starts.push(new Date(project.startDate).getTime());
  const startDay = dayIndex(Math.min(...starts));

  const ends = [Date.now(), ...tasks.map((t) => new Date(t.updatedAt).getTime())];
  if (project.targetDate) ends.push(new Date(project.targetDate).getTime());
  const endDay = Math.max(startDay, dayIndex(Math.max(...ends)));

  const span = Math.max(1, endDay - startDay);
  const step = Math.max(1, Math.ceil(span / MAX_POINTS));

  const idealEndDay = project.targetDate
    ? dayIndex(new Date(project.targetDate).getTime())
    : endDay;
  const idealSpan = Math.max(1, idealEndDay - startDay);

  const days: number[] = [];
  for (let d = startDay; d < endDay; d += step) days.push(d);
  days.push(endDay); // always include the final day

  const points = days.map((d): BurndownPoint => {
    const dayEnd = (d + 1) * DAY_MS - 1;
    let remaining = 0;
    for (const t of tasks) {
      if (new Date(t.createdAt).getTime() > dayEnd) continue;
      const done = t.status === "done" && new Date(t.updatedAt).getTime() <= dayEnd;
      if (!done) remaining += weight(t);
    }
    const ideal = Math.max(0, total * (1 - (d - startDay) / idealSpan));
    return { date: new Date(d * DAY_MS).toISOString().slice(0, 10), remaining: round1(remaining), ideal: round1(ideal) };
  });

  return { points, unit, total };
}
