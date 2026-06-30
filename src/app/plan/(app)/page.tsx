import { listProjects, teamLoad } from "@/lib/plan/queries";
import { ProjectGrid } from "@/components/plan/ProjectGrid";
import { TeamLoad } from "@/components/plan/TeamLoad";

export const dynamic = "force-dynamic";

export default async function PlanOverviewPage() {
  const [projects, team] = await Promise.all([listProjects(), teamLoad()]);
  return (
    <section className="space-y-10">
      <div>
        <h1 className="mb-6 text-2xl font-semibold">Projects</h1>
        <ProjectGrid projects={projects} />
      </div>
      <div>
        <h2 className="mb-4 text-xl font-semibold">Team load</h2>
        <TeamLoad rows={team} />
      </div>
    </section>
  );
}
