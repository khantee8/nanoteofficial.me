import { ProjectCard } from "./ProjectCard";
import { ProjectForm } from "./ProjectForm";
import { createProject } from "@/lib/plan/actions";
import type { ProjectWithProgress } from "@/lib/plan/types";
import type { Lang } from "@/lib/i18n";

export function ProjectGrid({ projects, lang }: { projects: ProjectWithProgress[]; lang: Lang }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => <ProjectCard key={p.id} p={p} lang={lang} />)}
      <ProjectForm action={createProject} />
    </div>
  );
}
