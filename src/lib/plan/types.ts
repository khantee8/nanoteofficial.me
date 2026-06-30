import type { Project, Task } from "@/lib/db/schema";

export const PROJECT_TYPES = ["it", "travel", "interview", "general"] as const;
export const TASK_STATUSES = ["backlog", "todo", "in_progress", "done"] as const;
export const STATUS_LABELS: Record<Task["status"], string> = {
  backlog: "Backlog", todo: "To do", in_progress: "In progress", done: "Done",
};

export type ProjectWithProgress = Project & { total: number; done: number; progress: number };
export type StatusCount = Record<Task["status"], number>;
