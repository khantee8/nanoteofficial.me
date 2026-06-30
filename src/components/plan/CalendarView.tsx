import type { Task } from "@/lib/db/schema";
export function CalendarView({ tasks }: { tasks: Task[] }) {
  void tasks;
  return <p className="opacity-60">Calendar coming soon.</p>;
}
