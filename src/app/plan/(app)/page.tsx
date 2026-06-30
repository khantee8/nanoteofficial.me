import { listProjects } from "@/lib/plan/queries";
import { ProjectGrid } from "@/components/plan/ProjectGrid";

export const dynamic = "force-dynamic";

export default async function PlanOverviewPage() {
  const projects = await listProjects();
  return (
    <section>
      <h1 className="mb-6 text-2xl font-semibold">Projects</h1>
      <ProjectGrid projects={projects} />
    </section>
  );
}
