"use client";
import { useState } from "react";
import { PROJECT_TYPES } from "@/lib/plan/types";
import type { Project } from "@/lib/db/schema";

export function ProjectForm({
  action, project, defaultOpen = false, label = "+ New project",
}: {
  action: (fd: FormData) => Promise<void>;
  project?: Project;
  defaultOpen?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="rounded-md border border-dashed border-black/20 p-4 text-sm dark:border-white/20">
      {label}
    </button>
  );
  return (
    <form action={async (fd) => { await action(fd); setOpen(false); }}
      className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/10">
      <input name="name" required defaultValue={project?.name ?? ""} placeholder="Project name" className="border-b bg-transparent py-1" />
      <select name="type" className="bg-transparent py-1" defaultValue={project?.type ?? "general"}>
        {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <input name="targetDate" type="date" defaultValue={project?.targetDate ?? ""} className="bg-transparent py-1" />
      <input name="color" type="color" defaultValue={project?.color ?? "#3B4FBF"} className="h-8 w-16" />
      <div className="flex gap-2">
        <button type="submit" className="rounded bg-[var(--feature-color)] px-3 py-1 text-sm text-white">Save</button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm underline">Cancel</button>
      </div>
    </form>
  );
}
