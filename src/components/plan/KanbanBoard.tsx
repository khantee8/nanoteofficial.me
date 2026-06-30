"use client";
import React, { useState } from "react";
import { DndContext, closestCorners, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TASK_STATUSES, STATUS_LABELS } from "@/lib/plan/types";
import { moveTask } from "@/lib/plan/actions";
import { KanbanCard } from "./KanbanCard";
import type { Task } from "@/lib/db/schema";

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef} className="flex flex-col gap-2">{children}</div>;
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {TASK_STATUSES.map((s) => (
          <div key={s} className="rounded-lg bg-black/5 p-2 dark:bg-white/5">
            <h3 className="mb-2 text-xs font-semibold uppercase opacity-60">{STATUS_LABELS[s]}</h3>
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
