"use client";
import React, { useRef, useState } from "react";
import {
  DndContext, DragOverlay, closestCorners, useDroppable,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TASK_STATUSES, STATUS_LABELS } from "@/lib/plan/types";
import type { PlanUser } from "@/lib/plan/types";
import { moveTask, createTask, deleteTask } from "@/lib/plan/actions";
import { KanbanCard, CardVisual } from "./KanbanCard";
import { TaskDrawer } from "./TaskDrawer";
import { useToast } from "./Toaster";
import { PlusIcon } from "./ui";
import type { Task } from "@/lib/db/schema";

const COL_DOT: Record<Task["status"], string> = {
  backlog: "bg-slate-400", todo: "bg-blue-500", in_progress: "bg-amber-500", done: "bg-emerald-500",
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

function QuickAdd({ projectId, status, onError }: { projectId: string; status: Task["status"]; onError: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="mt-1 inline-flex items-center gap-1 px-1 text-xs text-[var(--muted-soft)] transition hover:text-[var(--feature-color)]">
      <PlusIcon className="h-3.5 w-3.5" /> Add
    </button>
  );
  return (
    <form
      action={async () => {
        const t = title.trim();
        if (!t) { setOpen(false); return; }
        const fd = new FormData(); fd.set("title", t); fd.set("status", status);
        setTitle(""); setOpen(false);
        try { await createTask(projectId, fd); } catch { onError(); }
      }}
      className="mt-1">
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
        onBlur={(e) => { if (!e.currentTarget.form) return; e.currentTarget.form.requestSubmit(); }}
        placeholder="Task title…"
        className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm outline-none focus:border-[var(--feature-color)]" />
    </form>
  );
}

export function KanbanBoard({ projectId, tasks, users = [] }: { projectId: string; tasks: Task[]; users?: PlanUser[] }) {
  const [items, setItems] = useState(tasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Task | null>(null);
  const pending = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const toast = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byStatus = (s: Task["status"]) => items.filter((t) => t.status === s);
  const active = activeId ? items.find((t) => t.id === activeId) ?? null : null;

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const id = String(e.active.id);
    const over = e.over?.id ? String(e.over.id) : null;
    if (!over) return;
    const target = over.startsWith("col:")
      ? (over.slice(4) as Task["status"])
      : items.find((t) => t.id === over)?.status;
    if (!target) return;
    const prev = items.find((t) => t.id === id);
    if (prev && prev.status === target) return;
    const order = byStatus(target).filter((t) => t.id !== id).length;
    const snapshot = items;
    setItems((p) => p.map((t) => (t.id === id ? { ...t, status: target, order } : t)));
    moveTask(id, target, order).catch(() => { setItems(snapshot); toast("Couldn’t move task", { tone: "error" }); });
  }

  const onDelete = (task: Task) => {
    setItems((l) => l.filter((t) => t.id !== task.id));
    const timer = setTimeout(async () => {
      pending.current.delete(task.id);
      try { await deleteTask(task.id); } catch { toast("Couldn’t delete task", { tone: "error" }); setItems((l) => [...l, task]); }
    }, 6000);
    pending.current.set(task.id, timer);
    toast("Task deleted", {
      tone: "info",
      action: {
        label: "Undo",
        onClick: () => {
          const t = pending.current.get(task.id);
          if (!t) return; // already committed
          clearTimeout(t); pending.current.delete(task.id);
          setItems((l) => (l.some((x) => x.id === task.id) ? l : [...l, task]));
        },
      },
    });
  };

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners}
        onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))} onDragEnd={onDragEnd}>
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
                  {byStatus(s).map((t) => <KanbanCard key={t.id} task={t} onOpen={() => setSelected(t)} />)}
                </DroppableColumn>
              </SortableContext>
              <QuickAdd projectId={projectId} status={s} onError={() => toast("Couldn’t add task", { tone: "error" })} />
            </div>
          ))}
        </div>
        <DragOverlay>{active ? <CardVisual task={active} dragging /> : null}</DragOverlay>
      </DndContext>
      <TaskDrawer task={selected} users={users} onClose={() => setSelected(null)} onDelete={onDelete} />
    </>
  );
}
