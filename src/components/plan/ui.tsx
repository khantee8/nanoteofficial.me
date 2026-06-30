import { STATUS_LABELS } from "@/lib/plan/types";
import type { Task } from "@/lib/db/schema";

/* Shared class tokens — keep every /plan control visually consistent. */
export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--feature-color)] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feature-color)] disabled:opacity-50";
export const btnSecondary =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium transition hover:bg-[var(--surface-2)] active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feature-color)]";
export const btnGhost =
  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feature-color)]";
export const btnDanger =
  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-[var(--muted)] transition hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400";
export const inputCls =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none transition placeholder:text-[var(--muted-soft)] focus:border-[var(--feature-color)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--feature-color)_25%,transparent)]";
export const cardCls =
  "rounded-xl border border-[var(--border)] bg-[var(--surface)] transition";

const STATUS_TONE: Record<Task["status"], string> = {
  backlog: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  todo: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
  in_progress: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  done: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
};
const STATUS_DOT: Record<Task["status"], string> = {
  backlog: "bg-slate-400",
  todo: "bg-blue-500",
  in_progress: "bg-amber-500",
  done: "bg-emerald-500",
};

export function StatusBadge({ status }: { status: Task["status"] }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function TypeBadge({ type, color }: { type: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]"
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
      {type}
    </span>
  );
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color ?? "var(--feature-color)" }}
      />
    </div>
  );
}

export function CalendarIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </svg>
  );
}

export function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" className={className} aria-hidden><path d="M12 5v14M5 12h14" /></svg>
  );
}
