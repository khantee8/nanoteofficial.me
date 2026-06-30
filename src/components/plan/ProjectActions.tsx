"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectForm } from "./ProjectForm";
import { updateProject, archiveProject } from "@/lib/plan/actions";
import type { Project } from "@/lib/db/schema";

export function ProjectActions({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  if (editing) return (
    <ProjectForm project={project} defaultOpen
      action={async (fd) => { await updateProject(project.id, fd); setEditing(false); }} />
  );
  return (
    <div className="flex gap-3 text-sm">
      <button onClick={() => setEditing(true)} className="underline">Edit</button>
      <button onClick={async () => {
        if (!confirm("Archive this project?")) return;
        await archiveProject(project.id);
        router.push("/plan");
      }} className="text-red-500 underline">Archive</button>
    </div>
  );
}
