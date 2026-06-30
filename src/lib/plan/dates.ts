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

export const DUE_TEXT: Record<DueState, string> = {
  overdue: "text-rose-600 dark:text-rose-400 font-medium",
  soon: "text-amber-600 dark:text-amber-400 font-medium",
  normal: "",
  none: "",
};
