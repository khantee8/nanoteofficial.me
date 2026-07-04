import type { Project, Task, UserRole } from "@/lib/db/schema";

export const PROJECT_TYPES = ["it", "travel", "interview", "general"] as const;
export const TASK_STATUSES = ["backlog", "todo", "in_progress", "done"] as const;
export const STATUS_LABELS: Record<Task["status"], string> = {
  backlog: "Backlog", todo: "To do", in_progress: "In progress", done: "Done",
};

export type ProjectWithProgress = Project & { total: number; done: number; progress: number };
export type StatusCount = Record<Task["status"], number>;

export type PlanUser = { id: string; name: string | null; email: string | null };

export const USER_ROLES: UserRole[] = ["admin", "editor", "viewer"];

export function canEditPlan(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

export type PlanUserWithRole = PlanUser & { role: UserRole };

/** Weekly capacity fallback (hours) — used when an assignee has no dated open
 *  tasks; otherwise capacity = workdays until their furthest due date × 8h. */
export const DEFAULT_CAPACITY_HOURS = 40;

export type TeamLoadRow = {
  assigneeId: string | null;
  name: string | null;
  email: string | null;
  openCount: number;
  openHours: number;
  /** Furthest due date among open tasks (ISO), null when none are dated. */
  maxDue: string | null;
};

export function userLabel(u: { name: string | null; email: string | null }): string {
  return u.name?.trim() || u.email?.trim() || "Unknown";
}
