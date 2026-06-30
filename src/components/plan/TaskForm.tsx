"use client";
import { useState } from "react";
import { TASK_STATUSES, STATUS_LABELS } from "@/lib/plan/types";
import type { Task } from "@/lib/db/schema";

export function TaskForm({
  projectId, task, action, label = "+ Add task", defaultOpen = false,
}: {
  projectId: string;
  task?: Task;
  action: (fd: FormData) => Promise<void>;
  label?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!open) return <button onClick={() => setOpen(true)} className="text-sm underline">{label}</button>;
  return (
    <form action={async (fd) => { await action(fd); setOpen(false); }}
      className="flex flex-col gap-2 rounded-md border border-black/10 p-3 dark:border-white/10">
      <input type="hidden" name="projectId" value={projectId} />
      <input name="title" required defaultValue={task?.title ?? ""} placeholder="Title" className="border-b bg-transparent py-1" />
      <select name="status" defaultValue={task?.status ?? "backlog"} className="bg-transparent py-1">
        {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
      </select>
      <input name="dueDate" type="date" defaultValue={task?.dueDate ?? ""} className="bg-transparent py-1" />
      <input name="estimateHours" type="number" step="0.5" defaultValue={task?.estimateHours ?? ""} placeholder="Estimate (h)" className="bg-transparent py-1" />
      <input name="cost" type="number" step="0.01" defaultValue={task?.cost ?? ""} placeholder="Cost" className="bg-transparent py-1" />
      <input name="tags" defaultValue={(task?.tags ?? []).join(", ")} placeholder="tags, comma separated" className="bg-transparent py-1" />
      <div className="flex gap-2">
        <button type="submit" className="rounded bg-[var(--feature-color)] px-3 py-1 text-sm text-white">Save</button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm underline">Cancel</button>
      </div>
    </form>
  );
}
