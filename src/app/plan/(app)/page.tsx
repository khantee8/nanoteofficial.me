import { listProjects, teamLoad } from "@/lib/plan/queries";
import { ProjectGrid } from "@/components/plan/ProjectGrid";
import { TeamLoad } from "@/components/plan/TeamLoad";

export const dynamic = "force-dynamic";

export default async function PlanOverviewPage() {
  const [projects, team] = await Promise.all([listProjects(), teamLoad()]);
  return (
    <section className="space-y-12">
      <div>
        <div className="mb-5 flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <span className="text-sm text-[var(--muted-soft)] tabular-nums">{projects.length}</span>
        </div>
        <ProjectGrid projects={projects} />
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Team load</h2>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <TeamLoad rows={team} />
        </div>
      </div>
    </section>
  );
}
