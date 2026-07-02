"use client";
import { useRef, useState } from "react";
import { TASK_STATUSES, userLabel } from "@/lib/plan/types";
import { WORKDAY_HOURS, workdaysBetween } from "@/lib/plan/dates";
import { statusKey } from "@/lib/plan/i18n";
import type { PlanUser } from "@/lib/plan/types";
import type { Task } from "@/lib/db/schema";
import { btnPrimary, btnGhost, inputCls, PlusIcon } from "./ui";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";

export function TaskForm({
  projectId, task, action, users = [], defaultOpen = false, bare = false, readOnly = false,
}: {
  projectId: string;
  task?: Task;
  action: (fd: FormData) => Promise<void>;
  users?: PlanUser[];
  defaultOpen?: boolean;
  /** Render the form fields directly (no toggle button / card chrome) — for the drawer. */
  bare?: boolean;
  /** Disable every field and hide the save/cancel row — viewers looking at a task. */
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const { t } = usePlanT();
  const startRef = useRef<HTMLInputElement>(null);
  const dueRef = useRef<HTMLInputElement>(null);
  const estRef = useRef<HTMLInputElement>(null);
  const lastAuto = useRef<string | null>(null);

  // Auto-fill estimate from the date range (workdays × 8h). Never overwrites a
  // value the user typed — only fills when empty or still equal to a prior auto-fill.
  const autoEstimate = () => {
    const start = startRef.current?.value, due = dueRef.current?.value, est = estRef.current;
    if (!start || !due || !est) return;
    const current = est.value.trim();
    if (current && current !== lastAuto.current) return;
    const days = workdaysBetween(start, due);
    if (days <= 0) return;
    const value = String(days * WORKDAY_HOURS);
    est.value = value;
    lastAuto.current = value;
  };

  if (!bare && !open) return (
    <button onClick={() => setOpen(true)}
      className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--feature-color)] hover:text-[var(--feature-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feature-color)]">
      <PlusIcon /> {t("task.add")}
    </button>
  );

  const onSubmit = async (fd: FormData) => {
    setPending(true);
    try {
      await action(fd);
      toast(t(task ? "toast.taskUpdated" : "toast.taskCreated"), { tone: "success" });
      if (!bare) setOpen(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : t("toast.taskSaveErr"), { tone: "error" });
    } finally {
      setPending(false);
    }
  };

  return (
    <form action={onSubmit}
      className={bare ? "flex flex-col gap-3" : "flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"}>
      <input type="hidden" name="projectId" value={projectId} />
      <input name="title" required defaultValue={task?.title ?? ""} placeholder={t("task.title")} className={inputCls} autoFocus disabled={readOnly} />
      <textarea name="description" defaultValue={task?.description ?? ""} placeholder={t("task.description")} rows={3} className={`${inputCls} resize-y`} disabled={readOnly} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          {t("task.status")}
          <select name="status" defaultValue={task?.status ?? "backlog"} className={inputCls} disabled={readOnly}>
            {TASK_STATUSES.map((s) => <option key={s} value={s}>{t(statusKey(s))}</option>)}
          </select>
        </label>
        {users.length > 0 && (
          <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
            {t("task.assignee")}
            <select name="assigneeId" defaultValue={task?.assigneeId ?? ""} className={inputCls} disabled={readOnly}>
              <option value="">{t("task.unassigned")}</option>
              {users.map((u) => <option key={u.id} value={u.id}>{userLabel(u)}</option>)}
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          {t("task.start")}
          <input ref={startRef} name="startDate" type="date" defaultValue={task?.startDate ?? ""} onChange={autoEstimate} className={inputCls} disabled={readOnly} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          {t("task.due")}
          <input ref={dueRef} name="dueDate" type="date" defaultValue={task?.dueDate ?? ""} onChange={autoEstimate} className={inputCls} disabled={readOnly} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          {t("task.estimate")}
          <input ref={estRef} name="estimateHours" type="number" step="0.5" defaultValue={task?.estimateHours ?? ""} placeholder="0" className={inputCls} disabled={readOnly} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          {t("task.cost")}
          <input name="cost" type="number" step="0.01" defaultValue={task?.cost ?? ""} placeholder="0.00" className={inputCls} disabled={readOnly} />
        </label>
      </div>
      <input name="tags" defaultValue={(task?.tags ?? []).join(", ")} placeholder={t("task.tags")} className={inputCls} disabled={readOnly} />
      {!readOnly && (
        <div className="flex gap-2">
          <button type="submit" className={btnPrimary} disabled={pending}>{pending ? t("common.saving") : t("common.save")}</button>
          {!bare && <button type="button" onClick={() => setOpen(false)} className={btnGhost}>{t("common.cancel")}</button>}
        </div>
      )}
    </form>
  );
}
