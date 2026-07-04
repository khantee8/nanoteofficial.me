"use client";
import { useRef, useState, useTransition } from "react";
import type { Task, UserRole } from "@/lib/db/schema";
import type { Lang } from "@/lib/i18n";
import type { PlanUser } from "@/lib/plan/types";
import { canEditPlan, userLabel } from "@/lib/plan/types";
import { computeGantt } from "@/lib/plan/gantt";
import { deleteTask, setTaskDates } from "@/lib/plan/actions";
import { addDays } from "@/lib/plan/dates";
import { statusKey } from "@/lib/plan/i18n";
import { TaskDrawer } from "./TaskDrawer";
import { Avatar, STATUS_DOT } from "./ui";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";

type Tip = { task: Task; top: number; left: number; below: boolean };
type DragMode = "move" | "start" | "end";
type Drag = { taskId: string; mode: DragMode; originX: number; dayPx: number; delta: number; moved: boolean };

export function GanttChart({ tasks, users, role, lang }: {
  tasks: Task[]; users: PlanUser[]; role: UserRole; lang: Lang;
}) {
  const [selected, setSelected] = useState<Task | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [labelPx, setLabelPx] = useState<number | null>(null);
  const resize = useRef<{ originX: number; startW: number; max: number } | null>(null);
  const justDragged = useRef(false);
  const [, startTransition] = useTransition();
  const toast = useToast();
  const { t } = usePlanT();
  const canEdit = canEditPlan(role);
  const g = computeGantt(tasks, { locale: lang === "th" ? "th-TH" : "en-GB" });
  const pct = (d: number) => `${(d / g.days) * 100}%`;
  const assigneeOf = (id: string | null) => users.find((u) => u.id === id) ?? null;

  const onDelete = async (task: Task) => {
    try { await deleteTask(task.id); toast(t("toast.taskDeleted"), { tone: "info" }); }
    catch { toast(t("toast.taskDeleteErr"), { tone: "error" }); }
  };

  const showTip = (task: Task) => (e: React.SyntheticEvent<HTMLButtonElement>) => {
    if (drag) return;
    const rowsEl = e.currentTarget.closest("[data-rows]");
    if (!rowsEl) return;
    const r = e.currentTarget.getBoundingClientRect();
    const p = rowsEl.getBoundingClientRect();
    const below = r.top - p.top < 56;
    setTip({
      task,
      left: Math.max(0, Math.min(r.left - p.left, p.width - 280)),
      top: below ? r.bottom - p.top + 6 : r.top - p.top - 6,
      below,
    });
  };
  const hideTip = () => setTip(null);
  const tipAssignee = tip ? assigneeOf(tip.task.assigneeId) : null;

  /* --- Drag to reschedule (editors, mouse/pen only; click still opens drawer) --- */
  const onBarPointerDown = (task: Task) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!canEdit || e.pointerType === "touch" || e.button !== 0) return;
    const track = e.currentTarget.closest("[data-track]");
    if (!track) return;
    const mode = ((e.target as HTMLElement).dataset.handle as DragMode | undefined) ?? "move";
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setTip(null);
    setDrag({ taskId: task.id, mode, originX: e.clientX, dayPx: track.getBoundingClientRect().width / g.days, delta: 0, moved: false });
  };

  const onBarPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const dx = e.clientX - drag.originX;
    const delta = Math.round(dx / drag.dayPx);
    const moved = drag.moved || Math.abs(dx) > 4;
    if (delta !== drag.delta || moved !== drag.moved) setDrag({ ...drag, delta, moved });
  };

  const onBarPointerUp = (task: Task) => () => {
    if (!drag) return;
    const { mode, delta, moved } = drag;
    setDrag(null);
    if (!moved) return; // plain click — the click handler opens the drawer
    justDragged.current = true;
    if (delta === 0) return;
    const s0 = (task.startDate ?? task.dueDate)!;
    const d0 = (task.dueDate ?? task.startDate)!;
    let ns = s0, nd = d0;
    if (mode === "move") { ns = addDays(s0, delta); nd = addDays(d0, delta); }
    else if (mode === "start") { ns = addDays(s0, delta); if (ns > nd) ns = nd; }
    else { nd = addDays(d0, delta); if (nd < ns) nd = ns; }
    startTransition(async () => {
      try { await setTaskDates(task.id, ns, nd); toast(t("toast.taskUpdated"), { tone: "success" }); }
      catch { toast(t("toast.taskSaveErr"), { tone: "error" }); }
    });
  };

  /* --- Drag the column divider to resize the task-label column --- */
  const onDividerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rows = e.currentTarget.closest("[data-rows]");
    if (!rows) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rowsRect = rows.getBoundingClientRect();
    resize.current = {
      originX: e.clientX,
      startW: e.currentTarget.getBoundingClientRect().left + e.currentTarget.offsetWidth / 2 - rowsRect.left,
      max: rowsRect.width * 0.6,
    };
  };
  const onDividerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resize.current) return;
    const w = Math.max(128, Math.min(resize.current.startW + e.clientX - resize.current.originX, resize.current.max));
    setLabelPx(w);
  };
  const onDividerUp = () => { resize.current = null; };

  const openDrawer = (task: Task) => {
    if (justDragged.current) { justDragged.current = false; return; }
    setSelected(task);
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
          {/* Label column flexes 11–18rem by default; the divider drag overrides it. */}
          <div className="min-w-[48rem]" style={{ "--gantt-label": labelPx ? `${labelPx}px` : "clamp(11rem, 26%, 18rem)" } as React.CSSProperties}>
            {/* Month labels */}
            <div className="relative ml-[var(--gantt-label)] h-5">
              {g.months.map((m) => (
                <span key={m.startIdx} style={{ left: pct(m.startIdx) }}
                  className="absolute whitespace-nowrap text-[10px] uppercase tracking-wide text-[var(--muted-soft)]">
                  {m.label}
                </span>
              ))}
            </div>
            <div className="relative" data-rows>
              {/* Week gridlines + today marker overlay */}
              <div className="pointer-events-none absolute inset-y-0 left-[var(--gantt-label)] right-0">
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
              {/* Column-resize divider (drag; double-click resets) */}
              <div role="separator" aria-orientation="vertical" aria-label={t("gantt.resize")}
                onPointerDown={onDividerDown} onPointerMove={onDividerMove}
                onPointerUp={onDividerUp} onPointerCancel={onDividerUp}
                onDoubleClick={() => setLabelPx(null)}
                className="absolute inset-y-0 z-10 w-2 -translate-x-1/2 cursor-col-resize touch-none bg-[linear-gradient(to_right,transparent_calc(50%-0.5px),var(--border)_calc(50%-0.5px),var(--border)_calc(50%+0.5px),transparent_calc(50%+0.5px))] transition hover:bg-[color-mix(in_srgb,var(--feature-color)_25%,transparent)]"
                style={{ left: "var(--gantt-label)" }} />
              {/* Rows */}
              {g.bars.map(({ task, startIdx, span, overdue }) => {
                const a = assigneeOf(task.assigneeId);
                // Ghost the bar into its dragged position while a drag is live.
                let dIdx = startIdx, dSpan = span;
                if (drag?.taskId === task.id && drag.moved) {
                  if (drag.mode === "move") dIdx = startIdx + drag.delta;
                  else if (drag.mode === "start") {
                    const dd = Math.min(drag.delta, span - 1);
                    dIdx = startIdx + dd; dSpan = span - dd;
                  } else dSpan = Math.max(1, span + drag.delta);
                }
                return (
                  <div key={task.id} className="flex items-center border-t border-[var(--border-soft)] first:border-t-0">
                    <button onClick={() => setSelected(task)} title={task.title}
                      className="flex w-[var(--gantt-label)] shrink-0 items-center gap-2 truncate px-2 py-2 text-left text-sm transition hover:bg-[var(--surface-2)]">
                      {a && <Avatar size="sm" name={a.name} email={a.email} />}
                      <span className={`truncate ${task.status === "done" ? "text-[var(--muted-soft)] line-through" : ""}`}>
                        {task.title}
                      </span>
                    </button>
                    <div className="relative h-9 min-w-0 flex-1" data-track>
                      <button onClick={() => openDrawer(task)}
                        onPointerDown={onBarPointerDown(task)}
                        onPointerMove={onBarPointerMove}
                        onPointerUp={onBarPointerUp(task)}
                        onPointerCancel={() => setDrag(null)}
                        onMouseEnter={showTip(task)} onMouseLeave={hideTip}
                        onFocus={showTip(task)} onBlur={hideTip}
                        aria-label={task.title}
                        className={`absolute top-1/2 h-3.5 min-w-2 -translate-y-1/2 rounded-full transition hover:opacity-80 ${STATUS_DOT[task.status]} ${
                          task.status === "done" ? "opacity-50" : ""
                        } ${overdue ? "ring-2 ring-rose-500/70" : ""} ${
                          canEdit ? "cursor-grab active:cursor-grabbing" : ""
                        } ${drag?.taskId === task.id && drag.moved ? "opacity-70 ring-2 ring-[var(--feature-color)]" : ""}`}
                        style={{ left: pct(dIdx), width: pct(dSpan) }}>
                        {canEdit && (
                          <>
                            <span data-handle="start" className="absolute inset-y-0 left-0 w-2 cursor-ew-resize" />
                            <span data-handle="end" className="absolute inset-y-0 right-0 w-2 cursor-ew-resize" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
              {/* Hover detail card */}
              {tip && !drag && (
                <div className="pointer-events-none absolute z-10 w-max max-w-[17rem] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 text-xs shadow-lg"
                  style={{ left: tip.left, top: tip.top, transform: tip.below ? undefined : "translateY(-100%)" }}>
                  <div className="font-medium">{tip.task.title}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[var(--muted)]">
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[tip.task.status]}`} />
                    {t(statusKey(tip.task.status))}
                    {tipAssignee && <span className="truncate">· {userLabel(tipAssignee)}</span>}
                  </div>
                  <div className="mt-0.5 tabular-nums text-[var(--muted-soft)]">
                    {tip.task.startDate ?? tip.task.dueDate} → {tip.task.dueDate ?? tip.task.startDate}
                    {tip.task.estimateHours != null && ` · ${tip.task.estimateHours}h`}
                  </div>
                </div>
              )}
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
