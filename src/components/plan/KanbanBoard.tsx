"use client";
import React, { useState } from "react";
import { DndContext, closestCorners, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TASK_STATUSES, STATUS_LABELS } from "@/lib/plan/types";
import { moveTask } from "@/lib/plan/actions";
import { KanbanCard } from "./KanbanCard";
import type { Task } from "@/lib/db/schema";

const COL_DOT: Record<Task["status"], string> = {
  backlog: "bg-slate-400",
  todo: "bg-blue-500",
  in_progress: "bg-amber-500",
  done: "bg-emerald-500",
};

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef}
      className={`flex min-h-24 flex-col gap-2 rounded-md p-1 transition ${
        isOver ? "bg-[color-mix(in_srgb,var(--feature-color)_10%,transparent)] ring-1 ring-[var(--feature-color)]" : ""
      }`}>
      {children}
    </div>
  );
}

export function KanbanBoard({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  void projectId;
  const [items, setItems] = useState(tasks);
  const byStatus = (s: Task["status"]) => items.filter((t) => t.status === s);

  function onDragEnd(e: DragEndEvent) {
    const id = String(e.active.id);
    const over = e.over?.id ? String(e.over.id) : null;
    if (!over) return;
    // `over` is either a column id ("col:status") or another card id.
    const target = over.startsWith("col:")
      ? (over.slice(4) as Task["status"])
      : items.find((t) => t.id === over)?.status;
    if (!target) return;
    const order = byStatus(target).filter((t) => t.id !== id).length;
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, status: target, order } : t)));
    void moveTask(id, target, order);
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TASK_STATUSES.map((s) => (
          <div key={s} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
            <h3 className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              <span className={`h-1.5 w-1.5 rounded-full ${COL_DOT[s]}`} />
              {STATUS_LABELS[s]}
              <span className="ml-auto rounded-full bg-[var(--surface-2)] px-1.5 text-[10px] font-medium tabular-nums text-[var(--muted-soft)]">
                {byStatus(s).length}
              </span>
            </h3>
            <SortableContext items={byStatus(s).map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <DroppableColumn id={`col:${s}`}>
                {byStatus(s).map((t) => <KanbanCard key={t.id} task={t} />)}
              </DroppableColumn>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
