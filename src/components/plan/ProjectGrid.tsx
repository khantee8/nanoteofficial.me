import { ProjectCard } from "./ProjectCard";
import { ProjectForm } from "./ProjectForm";
import { createProject } from "@/lib/plan/actions";
import { canEditPlan } from "@/lib/plan/types";
import type { ProjectWithProgress } from "@/lib/plan/types";
import { pt } from "@/lib/plan/i18n";
import { CalendarIcon } from "./ui";
import type { Lang } from "@/lib/i18n";
import type { UserRole } from "@/lib/db/schema";

export function ProjectGrid({ projects, lang, role }: { projects: ProjectWithProgress[]; lang: Lang; role: UserRole }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.length === 0 && (
        <div className="col-span-full rounded-xl border border-dashed border-[var(--border)] p-10 text-center">
          <CalendarIcon className="mx-auto h-6 w-6 opacity-40" />
          <p className="mt-2 text-sm text-[var(--muted-soft)]">{pt(lang, "grid.empty")}</p>
        </div>
      )}
      {projects.map((p) => <ProjectCard key={p.id} p={p} lang={lang} />)}
      {canEditPlan(role) && <ProjectForm action={createProject} />}
    </div>
  );
}
