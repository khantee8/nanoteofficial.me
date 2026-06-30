import { notFound } from "next/navigation";
import { getProject, listTasks, listUsers, statusCounts } from "@/lib/plan/queries";
import { createTask } from "@/lib/plan/actions";
import { computeBurndown } from "@/lib/plan/burndown";
import { ViewTabs } from "@/components/plan/ViewTabs";
import { StatusOverview } from "@/components/plan/StatusOverview";
import { TableView } from "@/components/plan/TableView";
import { KanbanBoard } from "@/components/plan/KanbanBoard";
import { CalendarView } from "@/components/plan/CalendarView";
import { BurndownChart } from "@/components/plan/BurndownChart";
import { TaskForm } from "@/components/plan/TaskForm";
import { ProjectActions } from "@/components/plan/ProjectActions";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params, searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { projectId } = await params;
  const { view = "table" } = await searchParams;
  const project = await getProject(projectId);
  if (!project) notFound();
  const [tasks, counts, users] = await Promise.all([
    listTasks(projectId), statusCounts(projectId), listUsers(),
  ]);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <ProjectActions project={project} />
      </div>
      <StatusOverview counts={counts} />
      <ViewTabs />
      {view !== "burndown" && (
        <div className="mb-4"><TaskForm projectId={projectId} users={users} action={createTask.bind(null, projectId)} /></div>
      )}
      {view === "kanban" ? <KanbanBoard projectId={projectId} tasks={tasks} />
        : view === "calendar" ? <CalendarView tasks={tasks} />
        : view === "burndown" ? <BurndownChart data={computeBurndown(tasks, project)} />
        : <TableView projectId={projectId} tasks={tasks} users={users} />}
    </section>
  );
}
