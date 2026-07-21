import {
  pgTable, text, timestamp, boolean, integer, numeric, date,
  uuid, primaryKey, pgEnum, jsonb, unique,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/* ---- Auth.js standard tables (Drizzle adapter shape) ---- */
export const userRole = pgEnum("user_role", ["admin", "editor", "viewer"]);

export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: userRole("role").notNull().default("viewer"),
});

export const accounts = pgTable("account", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccountType>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (a) => [primaryKey({ columns: [a.provider, a.providerAccountId] })]);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]);

/* ---- Plan domain ---- */
export const projectType = pgEnum("project_type", ["it", "travel", "interview", "general"]);
export const taskStatus = pgEnum("task_status", ["backlog", "todo", "in_progress", "done"]);

export const projects = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: projectType("type").notNull().default("general"),
  description: text("description"),
  color: text("color").notNull().default("#3B4FBF"),
  startDate: date("start_date"),
  targetDate: date("target_date"),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable("task", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatus("status").notNull().default("backlog"),
  assigneeId: text("assignee_id").references(() => users.id, { onDelete: "set null" }),
  startDate: date("start_date"),
  dueDate: date("due_date"),
  estimateHours: numeric("estimate_hours"),
  cost: numeric("cost"),
  tags: text("tags").array().notNull().default([]),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** AI-generated slide decks, versioned per project — see the AI Slide button
 *  on a project's page. No separate "plan" entity: the project row already
 *  is the plan; this table is just its deck history. */
export const deckVersion = pgTable("deck_version", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  versionNo: integer("version_no").notNull(),
  deckJson: jsonb("deck_json").notNull(),
  metaJson: jsonb("meta_json").notNull().default({}),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [unique("deck_version_project_version_unique").on(t.projectId, t.versionNo)]);

export const invites = pgTable("invite", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  role: userRole("role").notNull().default("viewer"),
  invitedBy: text("invited_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserRole = User["role"];
export type Invite = typeof invites.$inferSelect;
export type DeckVersion = typeof deckVersion.$inferSelect;
export type NewDeckVersion = typeof deckVersion.$inferInsert;
