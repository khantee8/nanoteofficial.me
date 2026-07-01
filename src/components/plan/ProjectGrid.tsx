import { ProjectCard } from "./ProjectCard";
import { ProjectForm } from "./ProjectForm";
import { createProject } from "@/lib/plan/actions";
import { canEditPlan } from "@/lib/plan/types";
import type { ProjectWithProgress } from "@/lib/plan/types";
import type { Lang } from "@/lib/i18n";
import type { UserRole } from "@/lib/db/schema";

export function ProjectGrid({ projects, lang, role }: { projects: ProjectWithProgress[]; lang: Lang; role: UserRole }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => <ProjectCard key={p.id} p={p} lang={lang} />)}
      {canEditPlan(role) && <ProjectForm action={createProject} />}
    </div>
  );
}
