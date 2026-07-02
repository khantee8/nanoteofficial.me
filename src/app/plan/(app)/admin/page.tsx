import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLang } from "@/lib/i18n";
import { pt, roleKey } from "@/lib/plan/i18n";
import { listPendingInvites, listUsersForAdmin } from "@/lib/plan/queries";
import { userLabel } from "@/lib/plan/types";
import { RoleSelect } from "@/components/plan/RoleSelect";
import { InviteForm } from "@/components/plan/InviteForm";
import { InviteRowActions } from "@/components/plan/InviteRowActions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user.role !== "admin") redirect("/plan");
  const [users, invites, lang] = await Promise.all([
    listUsersForAdmin(), listPendingInvites(), getLang(),
  ]);
  const currentEmail = session.user.email;
  const th = "px-4 py-2.5 font-medium";

  return (
    <section className="space-y-10">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">{pt(lang, "admin.title")}</h1>
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-soft)]">
                <th className={th}>{pt(lang, "admin.user")}</th>
                <th className={th}>{pt(lang, "admin.role")}</th>
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
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{pt(lang, "admin.invites")}</h2>
          <p className="mt-1 text-sm text-[var(--muted-soft)]">{pt(lang, "admin.invitesDesc")}</p>
        </div>
        <InviteForm />
        {invites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted-soft)]">
            {pt(lang, "admin.noInvites")}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-soft)]">
                  <th className={th}>{pt(lang, "admin.user")}</th>
                  <th className={th}>{pt(lang, "admin.role")}</th>
                  <th className={th}>{pt(lang, "admin.invitedOn")}</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => (
                  <tr key={inv.id} className="border-t border-[var(--border-soft)]">
                    <td className="px-4 py-2.5">{inv.email}</td>
                    <td className="px-4 py-2.5 text-[var(--muted)]">{pt(lang, roleKey(inv.role))}</td>
                    <td className="px-4 py-2.5 text-[var(--muted)]">
                      {inv.createdAt.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-2.5"><InviteRowActions inviteId={inv.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
