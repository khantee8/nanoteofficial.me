import "server-only";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, tasks } from "@/lib/db/schema";
import type { Project, Task } from "@/lib/db/schema";
import type { ProjectWithProgress, StatusCount } from "./types";

export async function listProjects(): Promise<ProjectWithProgress[]> {
  const rows = await db
    .select({
      p: projects,
      total: sql<number>`count(${tasks.id})::int`,
      done: sql<number>`(count(${tasks.id}) filter (where ${tasks.status} = 'done'))::int`,
    })
    .from(projects)
    .leftJoin(tasks, eq(tasks.projectId, projects.id))
    .where(eq(projects.archived, false))
    .groupBy(projects.id)
    .orderBy(asc(projects.createdAt));

  return rows.map(({ p, total, done }) => ({
    ...p, total, done, progress: total ? Math.round((done / total) * 100) : 0,
  }));
}

export async function getProject(id: string): Promise<Project | null> {
  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return row ?? null;
}

export async function listTasks(projectId: string): Promise<Task[]> {
  return db.select().from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(
      sql`case ${tasks.status} when 'backlog' then 0 when 'todo' then 1 when 'in_progress' then 2 when 'done' then 3 end`,
      asc(tasks.order),
    );
}

export async function statusCounts(projectId: string): Promise<StatusCount> {
  const rows = await db
    .select({ status: tasks.status, n: sql<number>`count(*)::int` })
    .from(tasks).where(eq(tasks.projectId, projectId)).groupBy(tasks.status);
  const out: StatusCount = { backlog: 0, todo: 0, in_progress: 0, done: 0 };
  for (const r of rows) out[r.status] = r.n;
  return out;
}
