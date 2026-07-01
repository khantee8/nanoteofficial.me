import { auth } from "@/auth";
import { getLang } from "@/lib/i18n";
import { pt } from "@/lib/plan/i18n";
import { listProjects, teamLoad } from "@/lib/plan/queries";
import { ProjectGrid } from "@/components/plan/ProjectGrid";
import { TeamLoad } from "@/components/plan/TeamLoad";

export const dynamic = "force-dynamic";

export default async function PlanOverviewPage() {
  const [projects, team, lang, session] = await Promise.all([listProjects(), teamLoad(), getLang(), auth()]);
  const role = session!.user.role;
  return (
    <section className="space-y-12">
      <div>
        <div className="mb-5 flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{pt(lang, "nav.projects")}</h1>
          <span className="text-sm text-[var(--muted-soft)] tabular-nums">{projects.length}</span>
        </div>
        <ProjectGrid projects={projects} lang={lang} role={role} />
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">{pt(lang, "overview.teamLoad")}</h2>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <TeamLoad rows={team} lang={lang} />
        </div>
      </div>
    </section>
  );
}
