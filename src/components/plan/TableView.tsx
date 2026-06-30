"use client";
import { useMemo, useRef, useState } from "react";
import { userLabel, STATUS_LABELS, TASK_STATUSES } from "@/lib/plan/types";
import type { PlanUser } from "@/lib/plan/types";
import { deleteTask } from "@/lib/plan/actions";
import { dueState, DUE_TEXT } from "@/lib/plan/dates";
import { StatusBadge, inputCls } from "./ui";
import { TaskDrawer } from "./TaskDrawer";
import { useToast } from "./Toaster";
import type { Task } from "@/lib/db/schema";

type SortKey = "title" | "status" | "dueDate" | "estimateHours" | "cost";
const STATUS_ORDER: Record<Task["status"], number> = { backlog: 0, todo: 1, in_progress: 2, done: 3 };

export function TableView({ tasks, users = [] }: { tasks: Task[]; users?: PlanUser[] }) {
  const [list, setList] = useState(tasks);
  const [selected, setSelected] = useState<Task | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Task["status"]>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null);
  const pending = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const toast = useToast();

  const nameOf = (id: string | null) => {
    if (!id) return "—";
    const u = users.find((x) => x.id === id);
    return u ? userLabel(u) : "—";
  };

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let r = list.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!needle) return true;
      return t.title.toLowerCase().includes(needle)
        || (t.description ?? "").toLowerCase().includes(needle)
        || t.tags.some((tag) => tag.toLowerCase().includes(needle));
    });
    if (sort) {
      const { key, dir } = sort;
      r = [...r].sort((a, b) => {
        let av: number | string, bv: number | string;
        if (key === "status") { av = STATUS_ORDER[a.status]; bv = STATUS_ORDER[b.status]; }
        else if (key === "estimateHours" || key === "cost") { av = Number(a[key] ?? -1); bv = Number(b[key] ?? -1); }
        else { av = (a[key] ?? "").toString(); bv = (b[key] ?? "").toString(); }
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }
    return r;
  }, [list, query, statusFilter, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s?.key === key ? (s.dir === 1 ? { key, dir: -1 } : null) : { key, dir: 1 }));
  const sortMark = (key: SortKey) => (sort?.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : "");

  const onDelete = (task: Task) => {
    setList((l) => l.filter((t) => t.id !== task.id));
    const timer = setTimeout(async () => {
      pending.current.delete(task.id);
      try { await deleteTask(task.id); } catch { toast("Couldn’t delete task", { tone: "error" }); setList((l) => [...l, task]); }
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
          setList((l) => (l.some((x) => x.id === task.id) ? l : [...l, task]));
        },
      },
    });
  };

  const th = "px-4 py-2.5 font-medium select-none";
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks…"
          className={`${inputCls} max-w-xs`} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className={`${inputCls} max-w-[10rem]`}>
          <option value="all">All statuses</option>
          {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <span className="ml-auto text-xs text-[var(--muted-soft)] tabular-nums">{rows.length} of {list.length}</span>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted-soft)]">
          {list.length === 0 ? "No tasks yet. Use “Add task” above to create your first one." : "No tasks match your filters."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <table className="w-full min-w-[44rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-soft)]">
                <th className={`${th} cursor-pointer`} onClick={() => toggleSort("title")}>Title{sortMark("title")}</th>
                <th className={`${th} cursor-pointer`} onClick={() => toggleSort("status")}>Status{sortMark("status")}</th>
                <th className={th}>Assignee</th>
                <th className={`${th} cursor-pointer`} onClick={() => toggleSort("dueDate")}>Due{sortMark("dueDate")}</th>
                <th className={`${th} cursor-pointer text-right`} onClick={() => toggleSort("estimateHours")}>Est (h){sortMark("estimateHours")}</th>
                <th className={`${th} cursor-pointer text-right`} onClick={() => toggleSort("cost")}>Cost{sortMark("cost")}</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const ds = dueState(t);
                return (
                  <tr key={t.id} onClick={() => setSelected(t)}
                    className="cursor-pointer border-t border-[var(--border-soft)] transition hover:bg-[var(--surface-2)]">
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
                    <td className={`px-4 py-2.5 ${ds === "overdue" || ds === "soon" ? DUE_TEXT[ds] : "text-[var(--muted)]"}`}>{t.dueDate ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--muted)]">{t.estimateHours ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--muted)]">{t.cost ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={(e) => { e.stopPropagation(); onDelete(t); }}
                        className="rounded-md px-2 py-1 text-sm text-[var(--muted-soft)] transition hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <TaskDrawer task={selected} users={users} onClose={() => setSelected(null)} onDelete={onDelete} />
    </div>
  );
}
