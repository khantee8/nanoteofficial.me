"use client";
import { useState } from "react";
import type { Task, UserRole } from "@/lib/db/schema";
import type { Lang } from "@/lib/i18n";
import type { PlanUser } from "@/lib/plan/types";
import { computeGantt } from "@/lib/plan/gantt";
import { deleteTask } from "@/lib/plan/actions";
import { TaskDrawer } from "./TaskDrawer";
import { Avatar, STATUS_DOT } from "./ui";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";

export function GanttChart({ tasks, users, role, lang }: {
  tasks: Task[]; users: PlanUser[]; role: UserRole; lang: Lang;
}) {
  const [selected, setSelected] = useState<Task | null>(null);
  const toast = useToast();
  const { t } = usePlanT();
  const g = computeGantt(tasks, { locale: lang === "th" ? "th-TH" : "en-GB" });
  const pct = (d: number) => `${(d / g.days) * 100}%`;
  const assigneeOf = (id: string | null) => users.find((u) => u.id === id) ?? null;

  const onDelete = async (task: Task) => {
    try { await deleteTask(task.id); toast(t("toast.taskDeleted"), { tone: "info" }); }
    catch { toast(t("toast.taskDeleteErr"), { tone: "error" }); }
  };

  if (g.bars.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted-soft)]">
        {t("gantt.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <figure className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[48rem]">
            {/* Month labels */}
            <div className="relative ml-[12rem] h-5">
              {g.months.map((m) => (
                <span key={m.startIdx} style={{ left: pct(m.startIdx) }}
                  className="absolute text-[10px] uppercase tracking-wide text-[var(--muted-soft)]">
                  {m.label}
                </span>
              ))}
            </div>
            <div className="relative">
              {/* Week gridlines + today marker overlay */}
              <div className="pointer-events-none absolute inset-y-0 left-[12rem] right-0">
                {g.weeks.map((w) => (
                  <span key={w} className="absolute inset-y-0 w-px bg-current opacity-[0.06]"
                    style={{ left: pct(w) }} />
                ))}
                {g.todayIdx != null && (
                  <span className="absolute inset-y-0 w-px opacity-60"
                    style={{ left: pct(g.todayIdx + 0.5), background: "var(--feature-color)" }}>
                    <span className="absolute -top-0.5 left-1 text-[9px]" style={{ color: "var(--feature-color)" }}>
                      {t("gantt.today")}
                    </span>
                  </span>
                )}
              </div>
              {/* Rows */}
              {g.bars.map(({ task, startIdx, span, overdue }) => {
                const a = assigneeOf(task.assigneeId);
                return (
                  <div key={task.id} className="flex items-center border-t border-[var(--border-soft)] first:border-t-0">
                    <button onClick={() => setSelected(task)}
                      className="flex w-[12rem] shrink-0 items-center gap-2 truncate px-2 py-2 text-left text-sm transition hover:bg-[var(--surface-2)]">
                      {a && <Avatar size="sm" name={a.name} email={a.email} />}
                      <span className={`truncate ${task.status === "done" ? "text-[var(--muted-soft)] line-through" : ""}`}>
                        {task.title}
                      </span>
                    </button>
                    <div className="relative h-9 min-w-0 flex-1">
                      <button onClick={() => setSelected(task)}
                        title={`${task.startDate ?? task.dueDate} → ${task.dueDate ?? task.startDate}`}
                        aria-label={task.title}
                        className={`absolute top-1/2 h-3.5 min-w-2 -translate-y-1/2 rounded-full transition hover:opacity-80 ${STATUS_DOT[task.status]} ${
                          task.status === "done" ? "opacity-50" : ""
                        } ${overdue ? "ring-2 ring-rose-500/70" : ""}`}
                        style={{ left: pct(startIdx), width: pct(span) }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </figure>

      {g.unscheduled.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted-soft)]">
            {t("gantt.unscheduled")} · {g.unscheduled.length}
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {g.unscheduled.map((task) => (
              <button key={task.id} onClick={() => setSelected(task)}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]">
                {task.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <TaskDrawer task={selected} users={users} role={role}
        onClose={() => setSelected(null)} onDelete={onDelete} />
    </div>
  );
}
