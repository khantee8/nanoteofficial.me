"use client";
import { useState } from "react";
import { STATUS_LABELS } from "@/lib/plan/types";
import { updateTask, deleteTask } from "@/lib/plan/actions";
import { TaskForm } from "./TaskForm";
import type { Task } from "@/lib/db/schema";

export function TableView({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <table className="w-full text-sm">
      <thead><tr className="text-left opacity-60">
        <th className="py-2">Title</th><th>Status</th><th>Due</th><th>Est (h)</th><th>Cost</th><th></th>
      </tr></thead>
      <tbody>
        {tasks.map((t) => editing === t.id ? (
          <tr key={t.id}><td colSpan={6} className="py-2">
            <TaskForm projectId={projectId} task={t} defaultOpen action={async (fd) => { await updateTask(t.id, fd); setEditing(null); }} />
          </td></tr>
        ) : (
          <tr key={t.id} className="border-t border-black/5 dark:border-white/5">
            <td className="py-2">{t.title}</td>
            <td>{STATUS_LABELS[t.status]}</td>
            <td>{t.dueDate ?? "—"}</td>
            <td>{t.estimateHours ?? "—"}</td>
            <td>{t.cost ?? "—"}</td>
            <td className="text-right">
              <button onClick={() => setEditing(t.id)} className="mr-2 underline">edit</button>
              <button onClick={() => deleteTask(t.id)} className="text-red-500 underline">del</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
