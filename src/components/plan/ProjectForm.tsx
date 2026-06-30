"use client";
import { useState } from "react";
import { PROJECT_TYPES } from "@/lib/plan/types";
import type { Project } from "@/lib/db/schema";
import { btnPrimary, btnGhost, inputCls, PlusIcon } from "./ui";

export function ProjectForm({
  action, project, defaultOpen = false, label = "New project",
}: {
  action: (fd: FormData) => Promise<void>;
  project?: Project;
  defaultOpen?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex min-h-32 items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--border)] text-sm font-medium text-[var(--muted)] transition hover:border-[var(--feature-color)] hover:bg-[var(--surface)] hover:text-[var(--feature-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feature-color)]">
      <PlusIcon /> {label}
    </button>
  );
  return (
    <form action={async (fd) => { await action(fd); setOpen(false); }}
      className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <input name="name" required defaultValue={project?.name ?? ""} placeholder="Project name" className={inputCls} autoFocus />
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          Type
          <select name="type" className={inputCls} defaultValue={project?.type ?? "general"}>
            {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          Target date
          <input name="targetDate" type="date" defaultValue={project?.targetDate ?? ""} className={inputCls} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
        Color
        <input name="color" type="color" defaultValue={project?.color ?? "#3B4FBF"} className="h-8 w-12 cursor-pointer rounded border border-[var(--border)] bg-transparent" />
      </label>
      <div className="flex gap-2">
        <button type="submit" className={btnPrimary}>Save</button>
        <button type="button" onClick={() => setOpen(false)} className={btnGhost}>Cancel</button>
      </div>
    </form>
  );
}
