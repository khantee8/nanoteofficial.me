import "server-only";
import { and, asc, eq, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, tasks, users, invites } from "@/lib/db/schema";
import type { Project, Task, Invite } from "@/lib/db/schema";
import type { PlanUser, PlanUserWithRole, ProjectWithProgress, StatusCount, TeamLoadRow } from "./types";

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

export async function listUsers(): Promise<PlanUser[]> {
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .orderBy(asc(users.name), asc(users.email));
}

export async function listUsersForAdmin(): Promise<PlanUserWithRole[]> {
  return db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .orderBy(asc(users.name), asc(users.email));
}

/** Open (non-done) workload per assignee across all non-archived projects. */
export async function teamLoad(): Promise<TeamLoadRow[]> {
  const rows = await db
    .select({
      assigneeId: tasks.assigneeId,
      name: users.name,
      email: users.email,
      openCount: sql<number>`count(*)::int`,
      openHours: sql<number>`coalesce(sum(${tasks.estimateHours}), 0)::float`,
      maxDue: sql<string | null>`max(${tasks.dueDate})`,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(users, eq(tasks.assigneeId, users.id))
    .where(and(eq(projects.archived, false), ne(tasks.status, "done")))
    .groupBy(tasks.assigneeId, users.name, users.email)
    .orderBy(sql`sum(${tasks.estimateHours}) desc nulls last`);
  return rows;
}

/** Pending (unaccepted) invites — page is admin-gated. */
export async function listPendingInvites(): Promise<Invite[]> {
  return db.select().from(invites)
    .where(isNull(invites.acceptedAt))
    .orderBy(asc(invites.createdAt));
}
