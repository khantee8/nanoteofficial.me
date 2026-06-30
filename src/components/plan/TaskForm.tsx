"use client";
import { useState } from "react";
import { TASK_STATUSES, STATUS_LABELS, userLabel } from "@/lib/plan/types";
import type { PlanUser } from "@/lib/plan/types";
import type { Task } from "@/lib/db/schema";
import { btnPrimary, btnGhost, inputCls, PlusIcon } from "./ui";
import { useToast } from "./Toaster";

export function TaskForm({
  projectId, task, action, users = [], label = "Add task", defaultOpen = false, bare = false,
}: {
  projectId: string;
  task?: Task;
  action: (fd: FormData) => Promise<void>;
  users?: PlanUser[];
  label?: string;
  defaultOpen?: boolean;
  /** Render the form fields directly (no toggle button / card chrome) — for the drawer. */
  bare?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [pending, setPending] = useState(false);
  const toast = useToast();

  if (!bare && !open) return (
    <button onClick={() => setOpen(true)}
      className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--feature-color)] hover:text-[var(--feature-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feature-color)]">
      <PlusIcon /> {label}
    </button>
  );

  const onSubmit = async (fd: FormData) => {
    setPending(true);
    try {
      await action(fd);
      toast(task ? "Task updated" : "Task created", { tone: "success" });
      if (!bare) setOpen(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn’t save task", { tone: "error" });
    } finally {
      setPending(false);
    }
  };

  return (
    <form action={onSubmit}
      className={bare ? "flex flex-col gap-3" : "flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"}>
      <input type="hidden" name="projectId" value={projectId} />
      <input name="title" required defaultValue={task?.title ?? ""} placeholder="Task title" className={inputCls} autoFocus />
      <textarea name="description" defaultValue={task?.description ?? ""} placeholder="Description (optional)" rows={3} className={`${inputCls} resize-y`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          Status
          <select name="status" defaultValue={task?.status ?? "backlog"} className={inputCls}>
            {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </label>
        {users.length > 0 && (
          <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
            Assignee
            <select name="assigneeId" defaultValue={task?.assigneeId ?? ""} className={inputCls}>
              <option value="">— Unassigned —</option>
              {users.map((u) => <option key={u.id} value={u.id}>{userLabel(u)}</option>)}
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          Due date
          <input name="dueDate" type="date" defaultValue={task?.dueDate ?? ""} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          Estimate (h)
          <input name="estimateHours" type="number" step="0.5" defaultValue={task?.estimateHours ?? ""} placeholder="0" className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          Cost
          <input name="cost" type="number" step="0.01" defaultValue={task?.cost ?? ""} placeholder="0.00" className={inputCls} />
        </label>
      </div>
      <input name="tags" defaultValue={(task?.tags ?? []).join(", ")} placeholder="tags, comma separated" className={inputCls} />
      <div className="flex gap-2">
        <button type="submit" className={btnPrimary} disabled={pending}>{pending ? "Saving…" : "Save"}</button>
        {!bare && <button type="button" onClick={() => setOpen(false)} className={btnGhost}>Cancel</button>}
      </div>
    </form>
  );
}
