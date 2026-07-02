"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/lib/db/schema";
import { CalendarIcon, Avatar } from "./ui";
import { dueState, DUE_TEXT } from "@/lib/plan/dates";

/** Presentational card — reused for the live card and the drag overlay. */
export function CardVisual({ task, assignee, dragging }: {
  task: Task;
  assignee?: { name: string | null; email: string | null } | null;
  dragging?: boolean;
}) {
  const ds = dueState(task);
  return (
    <div className={`rounded-lg border bg-[var(--background)] p-2.5 text-sm shadow-sm transition ${
      dragging
        ? "border-[var(--feature-color)] shadow-md motion-safe:rotate-1"
        : "border-[var(--border)] hover:border-[color-mix(in_srgb,var(--feature-color)_40%,var(--border))]"
    }`}>
      <div className="font-medium leading-snug">{task.title}</div>
      {(task.dueDate || task.estimateHours != null || task.tags.length > 0 || assignee) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted-soft)]">
          {assignee && <Avatar size="sm" name={assignee.name} email={assignee.email} />}
          {task.dueDate && (
            <span className={`inline-flex items-center gap-1 ${ds === "overdue" || ds === "soon" ? DUE_TEXT[ds] : ""}`}>
              <CalendarIcon /> {task.dueDate}
            </span>
          )}
          {task.estimateHours != null && <span className="tabular-nums">{task.estimateHours}h</span>}
          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded bg-[var(--surface-2)] px-1.5 py-0.5">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function KanbanCard({ task, assignee, onOpen }: {
  task: Task;
  assignee?: { name: string | null; email: string | null } | null;
  onOpen?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes} {...listeners}
      onClick={() => onOpen?.()}
      className={`cursor-grab touch-none active:cursor-grabbing ${isDragging ? "opacity-40" : ""}`}>
      <CardVisual task={task} assignee={assignee} />
    </div>
  );
}
