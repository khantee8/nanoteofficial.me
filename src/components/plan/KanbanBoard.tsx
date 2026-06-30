import type { Task } from "@/lib/db/schema";
export function KanbanBoard({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  void projectId; void tasks;
  return <p className="opacity-60">Kanban coming soon.</p>;
}
