import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { deckVersion } from "@/lib/db/schema";
import type { DeckVersion, Project, Task } from "@/lib/db/schema";
import { STATUS_LABELS } from "@/lib/plan/types";

export async function listDeckVersions(projectId: string): Promise<DeckVersion[]> {
  return db.select().from(deckVersion)
    .where(eq(deckVersion.projectId, projectId))
    .orderBy(desc(deckVersion.versionNo));
}

export async function getDeckVersion(projectId: string, versionNo: number): Promise<DeckVersion | null> {
  const [row] = await db.select().from(deckVersion)
    .where(and(eq(deckVersion.projectId, projectId), eq(deckVersion.versionNo, versionNo)))
    .limit(1);
  return row ?? null;
}

/** Appends a new deck version for a project. `versionNo` is computed from the
 *  current max (single-admin-scale workspace; a concurrent double-generate
 *  races the unique (project_id, version_no) constraint and the loser throws
 *  — acceptable at this scale, matches the ported source app's same tradeoff). */
export async function addDeckVersion(
  projectId: string, deck: unknown, meta: unknown, createdBy: string | null,
): Promise<DeckVersion> {
  const existing = await listDeckVersions(projectId);
  const versionNo = (existing[0]?.versionNo ?? 0) + 1;
  const [row] = await db.insert(deckVersion).values({
    projectId, versionNo, deckJson: deck, metaJson: meta ?? {}, createdBy,
  }).returning();
  return row;
}

/** Turns a project's existing name/description/tasks into the AI's brief —
 *  no separate "plan" text to author; the project itself is the source of
 *  truth. The generate wizard's "extra context" field covers anything this
 *  doesn't capture. */
export function buildProjectBrief(project: Project, tasks: Task[]): string {
  const lines = [`${project.name} (${project.type})`];
  if (project.description) lines.push(project.description);
  if (project.targetDate) lines.push(`Target date: ${project.targetDate}`);
  if (tasks.length) {
    lines.push("", "Tasks:");
    for (const status of ["done", "in_progress", "todo", "backlog"] as const) {
      const inStatus = tasks.filter((t) => t.status === status);
      if (!inStatus.length) continue;
      lines.push(`${STATUS_LABELS[status]}: ${inStatus.map((t) => t.title).join(", ")}`);
    }
  }
  return lines.join("\n");
}
