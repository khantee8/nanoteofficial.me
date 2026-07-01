import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLang } from "@/lib/i18n";
import { pt } from "@/lib/plan/i18n";
import { listUsersForAdmin } from "@/lib/plan/queries";
import { userLabel } from "@/lib/plan/types";
import { RoleSelect } from "@/components/plan/RoleSelect";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user.role !== "admin") redirect("/plan");
  const [users, lang] = await Promise.all([listUsersForAdmin(), getLang()]);
  const currentEmail = session.user.email;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{pt(lang, "admin.title")}</h1>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <table className="w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-soft)]">
              <th className="px-4 py-2.5 font-medium">{pt(lang, "admin.user")}</th>
              <th className="px-4 py-2.5 font-medium">{pt(lang, "admin.role")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-[var(--border-soft)]">
                <td className="px-4 py-2.5">
                  <div className="font-medium">{userLabel(u)}</div>
                  <div className="text-xs text-[var(--muted-soft)]">{u.email}</div>
                </td>
                <td className="px-4 py-2.5">
                  <RoleSelect userId={u.id} role={u.role} disabled={u.email === currentEmail} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
