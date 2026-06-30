"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectForm } from "./ProjectForm";
import { updateProject, archiveProject } from "@/lib/plan/actions";
import type { Project } from "@/lib/db/schema";
import { btnSecondary, btnDanger } from "./ui";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";

export function ProjectActions({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { t } = usePlanT();
  if (editing) return (
    <div className="w-full max-w-md">
      <ProjectForm project={project} defaultOpen
        action={async (fd) => { await updateProject(project.id, fd); setEditing(false); }} />
    </div>
  );
  return (
    <div className="flex gap-2">
      <button onClick={() => setEditing(true)} className={btnSecondary}>{t("project.edit")}</button>
      <button onClick={async () => {
        if (!confirm(t("project.archiveConfirm"))) return;
        try {
          await archiveProject(project.id);
          toast(t("toast.projectArchived"), { tone: "success" });
          router.push("/plan");
        } catch {
          toast(t("toast.projectArchiveErr"), { tone: "error" });
        }
      }} className={btnDanger}>{t("project.archive")}</button>
    </div>
  );
}
