"use client";
import { useState } from "react";
import { PROJECT_TYPES } from "@/lib/plan/types";
import { typeKey } from "@/lib/plan/i18n";
import type { Project } from "@/lib/db/schema";
import { btnPrimary, btnGhost, inputCls, PlusIcon } from "./ui";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";

export function ProjectForm({
  action, project, defaultOpen = false,
}: {
  action: (fd: FormData) => Promise<void>;
  project?: Project;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const { t } = usePlanT();

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex min-h-32 items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--border)] text-sm font-medium text-[var(--muted)] transition hover:border-[var(--feature-color)] hover:bg-[var(--surface)] hover:text-[var(--feature-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feature-color)]">
      <PlusIcon /> {t("project.new")}
    </button>
  );

  const onSubmit = async (fd: FormData) => {
    setPending(true);
    try {
      await action(fd);
      toast(t(project ? "toast.projectUpdated" : "toast.projectCreated"), { tone: "success" });
      setOpen(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : t("toast.projectSaveErr"), { tone: "error" });
    } finally {
      setPending(false);
    }
  };
  return (
    <form action={onSubmit}
      className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <input name="name" required defaultValue={project?.name ?? ""} placeholder={t("pf.name")} className={inputCls} autoFocus />
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          {t("pf.type")}
          <select name="type" className={inputCls} defaultValue={project?.type ?? "general"}>
            {PROJECT_TYPES.map((ty) => <option key={ty} value={ty}>{t(typeKey(ty))}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          {t("pf.target")}
          <input name="targetDate" type="date" defaultValue={project?.targetDate ?? ""} className={inputCls} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
        {t("pf.color")}
        <input name="color" type="color" defaultValue={project?.color ?? "#3B4FBF"} className="h-8 w-12 cursor-pointer rounded border border-[var(--border)] bg-transparent" />
      </label>
      <div className="flex gap-2">
        <button type="submit" className={btnPrimary} disabled={pending}>{pending ? t("common.saving") : t("common.save")}</button>
        <button type="button" onClick={() => setOpen(false)} className={btnGhost}>{t("common.cancel")}</button>
      </div>
    </form>
  );
}
