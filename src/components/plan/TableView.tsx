"use client";
import { useState } from "react";
import { userLabel } from "@/lib/plan/types";
import type { PlanUser } from "@/lib/plan/types";
import { updateTask, deleteTask } from "@/lib/plan/actions";
import { TaskForm } from "./TaskForm";
import { StatusBadge, btnGhost, btnDanger } from "./ui";
import type { Task } from "@/lib/db/schema";

export function TableView({ projectId, tasks, users = [] }: { projectId: string; tasks: Task[]; users?: PlanUser[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const nameOf = (id: string | null) => {
    if (!id) return "—";
    const u = users.find((x) => x.id === id);
    return u ? userLabel(u) : "—";
  };

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted-soft)]">
        No tasks yet. Use “Add task” above to create your first one.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-soft)]">
            <th className="px-4 py-2.5 font-medium">Title</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Assignee</th>
            <th className="px-4 py-2.5 font-medium">Due</th>
            <th className="px-4 py-2.5 font-medium text-right">Est (h)</th>
            <th className="px-4 py-2.5 font-medium text-right">Cost</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => editing === t.id ? (
            <tr key={t.id}><td colSpan={7} className="bg-[var(--surface-2)] px-4 py-3">
              <TaskForm projectId={projectId} task={t} users={users} defaultOpen action={async (fd) => { await updateTask(t.id, fd); setEditing(null); }} />
            </td></tr>
          ) : (
            <tr key={t.id} className="border-t border-[var(--border-soft)] transition hover:bg-[var(--surface-2)]">
              <td className="px-4 py-2.5">
                <div className="font-medium">{t.title}</div>
                {t.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {t.tags.map((tag) => (
                      <span key={tag} className="rounded bg-[var(--background)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">#{tag}</span>
                    ))}
                  </div>
                )}
              </td>
              <td className="px-4 py-2.5"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-2.5 text-[var(--muted)]">{nameOf(t.assigneeId)}</td>
              <td className="px-4 py-2.5 text-[var(--muted)]">{t.dueDate ?? "—"}</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-[var(--muted)]">{t.estimateHours ?? "—"}</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-[var(--muted)]">{t.cost ?? "—"}</td>
              <td className="px-4 py-2.5">
                <div className="flex justify-end gap-1">
                  <button onClick={() => setEditing(t.id)} className={btnGhost}>Edit</button>
                  <button onClick={() => deleteTask(t.id)} className={btnDanger}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
