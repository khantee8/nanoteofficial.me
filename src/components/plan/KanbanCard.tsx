"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/lib/db/schema";

export function KanbanCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="cursor-grab rounded-md border border-black/10 bg-[var(--background)] p-2 text-sm dark:border-white/10">
      {task.title}
      {task.dueDate && <div className="mt-1 text-xs opacity-60">{task.dueDate}</div>}
    </div>
  );
}
