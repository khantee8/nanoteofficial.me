import type { Task } from "@/lib/db/schema";

/** Due-date urgency for non-done tasks. `none` = no date or already done. */
export type DueState = "overdue" | "soon" | "normal" | "none";

const DAY_MS = 86_400_000;

export function dueState(task: Pick<Task, "dueDate" | "status">, now = new Date()): DueState {
  if (!task.dueDate || task.status === "done") return "none";
  const due = new Date(task.dueDate + "T00:00:00").getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((due - today) / DAY_MS);
  if (diffDays < 0) return "overdue";
  if (diffDays <= 2) return "soon";
  return "normal";
}

/** Shift an ISO date by n days (UTC-stable). */
export function addDays(iso: string, days: number): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

export const WORKDAY_HOURS = 8;

/** Inclusive count of Mon–Fri days between two ISO dates; 0 when invalid or end < start. */
export function workdaysBetween(startIso: string, endIso: string): number {
  const start = Date.parse(`${startIso}T00:00:00Z`);
  const end = Date.parse(`${endIso}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  let n = 0;
  for (let ts = start; ts <= end; ts += DAY_MS) {
    const day = new Date(ts).getUTCDay();
    if (day !== 0 && day !== 6) n++;
  }
  return n;
}

export const DUE_TEXT: Record<DueState, string> = {
  overdue: "text-rose-600 dark:text-rose-400 font-medium",
  soon: "text-amber-600 dark:text-amber-400 font-medium",
  normal: "",
  none: "",
};
