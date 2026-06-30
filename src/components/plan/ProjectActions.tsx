"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectForm } from "./ProjectForm";
import { updateProject, archiveProject } from "@/lib/plan/actions";
import type { Project } from "@/lib/db/schema";
import { btnSecondary, btnDanger } from "./ui";

export function ProjectActions({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  if (editing) return (
    <div className="w-full max-w-md">
      <ProjectForm project={project} defaultOpen
        action={async (fd) => { await updateProject(project.id, fd); setEditing(false); }} />
    </div>
  );
  return (
    <div className="flex gap-2">
      <button onClick={() => setEditing(true)} className={btnSecondary}>Edit</button>
      <button onClick={async () => {
        if (!confirm("Archive this project?")) return;
        await archiveProject(project.id);
        router.push("/plan");
      }} className={btnDanger}>Archive</button>
    </div>
  );
}
