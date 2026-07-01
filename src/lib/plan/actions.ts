"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { projects, tasks, users } from "@/lib/db/schema";
import type { Task, UserRole } from "@/lib/db/schema";
import { auth } from "@/auth";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

async function requireEditor() {
  const user = await requireUser();
  if (user.role !== "admin" && user.role !== "editor") throw new Error("Forbidden");
  return user;
}

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Forbidden");
  return user;
}

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" && v.trim() ? v.trim() : null;
};
const num = (fd: FormData, k: string) => {
  const v = str(fd, k);
  return v == null ? null : v; // numeric columns accept string in drizzle
};

export async function createProject(fd: FormData): Promise<void> {
  await requireEditor();
  const name = str(fd, "name");
  if (!name) throw new Error("Name required");
  await db.insert(projects).values({
    name,
    type: (str(fd, "type") as never) ?? "general",
    description: str(fd, "description"),
    color: str(fd, "color") ?? "#3B4FBF",
    startDate: str(fd, "startDate"),
    targetDate: str(fd, "targetDate"),
  });
  revalidatePath("/plan");
}

export async function updateProject(id: string, fd: FormData): Promise<void> {
  await requireEditor();
  await db.update(projects).set({
    name: str(fd, "name") ?? undefined,
    type: (str(fd, "type") as never) ?? undefined,
    description: str(fd, "description"),
    color: str(fd, "color") ?? undefined,
    startDate: str(fd, "startDate"),
    targetDate: str(fd, "targetDate"),
    updatedAt: new Date(),
  }).where(eq(projects.id, id));
  revalidatePath("/plan");
  revalidatePath(`/plan/${id}`);
}

export async function archiveProject(id: string): Promise<void> {
  await requireEditor();
  await db.update(projects).set({ archived: true, updatedAt: new Date() })
    .where(eq(projects.id, id));
  revalidatePath("/plan");
}

export async function createTask(projectId: string, fd: FormData): Promise<void> {
  await requireEditor();
  const title = str(fd, "title");
  if (!title) throw new Error("Title required");
  await db.insert(tasks).values({
    projectId, title,
    description: str(fd, "description"),
    status: (str(fd, "status") as never) ?? "backlog",
    assigneeId: str(fd, "assigneeId"),
    startDate: str(fd, "startDate"),
    dueDate: str(fd, "dueDate"),
    estimateHours: num(fd, "estimateHours"),
    cost: num(fd, "cost"),
    tags: (str(fd, "tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
  });
  revalidatePath(`/plan/${projectId}`);
}

export async function updateTask(id: string, fd: FormData): Promise<void> {
  await requireEditor();
  const projectId = str(fd, "projectId");
  await db.update(tasks).set({
    title: str(fd, "title") ?? undefined,
    description: str(fd, "description"),
    status: (str(fd, "status") as never) ?? undefined,
    assigneeId: str(fd, "assigneeId"),
    startDate: str(fd, "startDate"),
    dueDate: str(fd, "dueDate"),
    estimateHours: num(fd, "estimateHours"),
    cost: num(fd, "cost"),
    tags: (str(fd, "tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    updatedAt: new Date(),
  }).where(eq(tasks.id, id));
  if (projectId) revalidatePath(`/plan/${projectId}`);
}

export async function deleteTask(id: string): Promise<void> {
  await requireEditor();
  const [row] = await db.delete(tasks).where(eq(tasks.id, id)).returning({ p: tasks.projectId });
  if (row) revalidatePath(`/plan/${row.p}`);
}

export async function moveTask(id: string, status: Task["status"], order: number): Promise<void> {
  await requireEditor();
  const [row] = await db.update(tasks).set({ status, order, updatedAt: new Date() })
    .where(eq(tasks.id, id)).returning({ p: tasks.projectId });
  if (row) revalidatePath(`/plan/${row.p}`);
}

export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  await requireAdmin();
  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath("/plan/admin");
}
