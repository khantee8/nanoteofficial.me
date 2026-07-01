import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getProject, listTasks, listUsers, statusCounts } from "@/lib/plan/queries";
import { createTask } from "@/lib/plan/actions";
import { computeBurndown } from "@/lib/plan/burndown";
import { canEditPlan } from "@/lib/plan/types";
import { getLang } from "@/lib/i18n";
import { pt, typeKey } from "@/lib/plan/i18n";
import { ViewTabs } from "@/components/plan/ViewTabs";
import { StatusOverview } from "@/components/plan/StatusOverview";
import { TableView } from "@/components/plan/TableView";
import { KanbanBoard } from "@/components/plan/KanbanBoard";
import { CalendarView } from "@/components/plan/CalendarView";
import { BurndownChart } from "@/components/plan/BurndownChart";
import { TaskForm } from "@/components/plan/TaskForm";
import { ProjectActions } from "@/components/plan/ProjectActions";
import { TypeBadge, CalendarIcon } from "@/components/plan/ui";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params, searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { projectId } = await params;
  const { view = "table" } = await searchParams;
  const [project, session] = await Promise.all([getProject(projectId), auth()]);
  if (!project) notFound();
  const role = session!.user.role;
  const [tasks, counts, users, lang] = await Promise.all([
    listTasks(projectId), statusCounts(projectId), listUsers(), getLang(),
  ]);
  // Signature changes on any add/edit/delete/move so client views reset to fresh server data.
  const tasksKey = `${tasks.length}:${tasks.reduce((m, t) => Math.max(m, new Date(t.updatedAt).getTime()), 0)}`;

  return (
    <section className="space-y-6">
      <div>
        <Link href="/plan" className="inline-flex items-center gap-1 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]">
          ← {pt(lang, "project.back")}
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
              <TypeBadge label={pt(lang, typeKey(project.type))} color={project.color} />
            </div>
            {project.targetDate && (
              <p className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-soft)]">
                <CalendarIcon /> {pt(lang, "project.target")} {project.targetDate}
              </p>
            )}
          </div>
          <ProjectActions project={project} role={role} />
        </div>
      </div>

      <StatusOverview counts={counts} lang={lang} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ViewTabs />
        {view !== "burndown" && canEditPlan(role) && (
          <TaskForm projectId={projectId} users={users} action={createTask.bind(null, projectId)} />
        )}
      </div>

      {view === "kanban" ? <KanbanBoard key={tasksKey} projectId={projectId} tasks={tasks} users={users} role={role} />
        : view === "calendar" ? <CalendarView tasks={tasks} lang={lang} />
        : view === "burndown" ? <BurndownChart data={computeBurndown(tasks, project)} lang={lang} />
        : <TableView key={tasksKey} tasks={tasks} users={users} role={role} />}
    </section>
  );
}
