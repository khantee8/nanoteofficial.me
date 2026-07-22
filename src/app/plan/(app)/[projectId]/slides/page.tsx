import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getProject } from "@/lib/plan/queries";
import { listDeckVersions } from "@/lib/plan/decks";
import { canEditPlan } from "@/lib/plan/types";
import { getLang } from "@/lib/i18n";
import { pt } from "@/lib/plan/i18n";
import { SlidesPanel } from "@/components/plan/slides/SlidesPanel";
import type { Deck } from "@/lib/slides/deck";
import { slideFontVars } from "@/lib/slides/fonts";

export const dynamic = "force-dynamic";

export default async function ProjectSlidesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [project, session, lang] = await Promise.all([getProject(projectId), auth(), getLang()]);
  if (!project) notFound();
  const role = session!.user.role;
  const versions = await listDeckVersions(projectId);

  return (
    <section className={`space-y-6 ${slideFontVars}`}>
      <div>
        <Link href={`/plan/${projectId}`} className="inline-flex items-center gap-1 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]">
          ← {project.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">✦ {pt(lang, "slides.title")}</h1>
      </div>
      <SlidesPanel
        projectId={projectId}
        projectName={project.name}
        audience=""
        canGenerate={canEditPlan(role)}
        initialVersions={versions.map((v) => ({
          versionNo: v.versionNo,
          deck: v.deckJson as Deck,
          meta: v.metaJson as { costUsd: number; lintFixed: number },
          createdAt: v.createdAt.toISOString(),
        }))}
      />
    </section>
  );
}
