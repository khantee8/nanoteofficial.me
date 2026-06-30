"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/lib/db/schema";
import { CalendarIcon } from "./ui";

export function KanbanCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`cursor-grab touch-none rounded-lg border border-[var(--border)] bg-[var(--background)] p-2.5 text-sm shadow-sm transition active:cursor-grabbing hover:border-[color-mix(in_srgb,var(--feature-color)_40%,var(--border))] ${
        isDragging ? "opacity-50 shadow-md" : ""
      }`}>
      <div className="font-medium leading-snug">{task.title}</div>
      {(task.dueDate || task.estimateHours != null || task.tags.length > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted-soft)]">
          {task.dueDate && <span className="inline-flex items-center gap-1"><CalendarIcon /> {task.dueDate}</span>}
          {task.estimateHours != null && <span className="tabular-nums">{task.estimateHours}h</span>}
          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded bg-[var(--surface-2)] px-1.5 py-0.5">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
