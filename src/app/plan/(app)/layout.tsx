import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getLang } from "@/lib/i18n";
import { pt } from "@/lib/plan/i18n";
import { listProjects } from "@/lib/plan/queries";
import { btnGhost } from "@/components/plan/ui";
import { Toaster } from "@/components/plan/Toaster";
import { CommandPalette } from "@/components/plan/CommandPalette";
import { LangProvider } from "@/components/plan/LangContext";
import { LangToggle } from "@/components/LangToggle";
import { PlanSidebar } from "@/components/plan/PlanSidebar";

export default async function PlanLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/plan/signin");
  const [projects, lang] = await Promise.all([listProjects(), getLang()]);

  return (
    <LangProvider lang={lang}>
      <Toaster>
        <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)] lg:flex">
          <PlanSidebar
            projects={projects.map((p) => ({ id: p.id, name: p.name, color: p.color }))}
            isAdmin={session.user.role === "admin"}
            email={session.user.email ?? ""}
            langToggle={<LangToggle current={lang} />}
            signOut={
              <form action={async () => { "use server"; await signOut({ redirectTo: "/plan/signin" }); }}>
                <button className={btnGhost} type="submit">{pt(lang, "action.signOut")}</button>
              </form>
            }
          />
          <div className="min-w-0 flex-1">
            <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
          </div>
        </div>
        <CommandPalette projects={projects.map((p) => ({ id: p.id, name: p.name, type: p.type }))} />
      </Toaster>
    </LangProvider>
  );
}
