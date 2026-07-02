import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens, invites } from "@/lib/db/schema";

const allowed = (process.env.ALLOWED_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

const admins = (process.env.PLAN_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Resend({ apiKey: process.env.RESEND_API_KEY, from: "noreply@nanoteofficial.me" }),
  ],
  session: { strategy: "database" },
  pages: { signIn: "/plan/signin" },
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;
      if (!allowed.includes(email)) {
        const [inv] = await db.select({ id: invites.id }).from(invites)
          .where(eq(invites.email, email)).limit(1);
        if (!inv) return false;
      }
      if (admins.includes(email)) {
        await db.update(users).set({ role: "admin" })
          .where(and(eq(users.email, email), ne(users.role, "admin")));
      }
      return true;
    },
    session({ session, user }) {
      session.user.role = user.role;
      return session;
    },
  },
  events: {
    // Fires after the adapter creates a first-time user — the signIn callback
    // runs before the row exists, so the invite role must be applied here.
    async createUser({ user }) {
      const email = user.email?.toLowerCase();
      if (!email || !user.id) return;
      const [inv] = await db.select().from(invites)
        .where(eq(invites.email, email)).limit(1);
      if (!inv || inv.acceptedAt) return;
      await db.update(users).set({ role: inv.role }).where(eq(users.id, user.id));
      await db.update(invites).set({ acceptedAt: new Date() }).where(eq(invites.id, inv.id));
    },
  },
});
