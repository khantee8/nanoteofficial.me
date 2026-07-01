import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getLang } from "@/lib/i18n";
import { pt } from "@/lib/plan/i18n";
import { listProjects } from "@/lib/plan/queries";
import { btnGhost } from "@/components/plan/ui";
import { Toaster } from "@/components/plan/Toaster";
import { CommandPalette } from "@/components/plan/CommandPalette";
import { LangProvider } from "@/components/plan/LangContext";
import { LangToggle } from "@/components/LangToggle";

export default async function PlanLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/plan/signin");
  const [projects, lang] = await Promise.all([listProjects(), getLang()]);

  return (
    <LangProvider lang={lang}>
      <Toaster>
        <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
          <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_80%,transparent)] backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
              <div className="flex items-center gap-6">
                <Link href="/plan" className="flex items-center gap-2 font-semibold tracking-tight">
                  <span className="h-2 w-2 rounded-full" style={{ background: "var(--feature-color)" }} />
                  Plan
                </Link>
                <Link href="/plan" className="hidden text-sm text-[var(--muted)] transition hover:text-[var(--foreground)] sm:block">
                  {pt(lang, "nav.projects")}
                </Link>
                {session.user.role === "admin" && (
                  <Link href="/plan/admin" className="hidden text-sm text-[var(--muted)] transition hover:text-[var(--foreground)] sm:block">
                    {pt(lang, "nav.admin")}
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--muted-soft)] lg:inline-flex">
                  <kbd className="font-sans">⌘</kbd><kbd className="font-sans">K</kbd>
                </span>
                <LangToggle current={lang} />
                <span className="hidden text-sm text-[var(--muted-soft)] md:block">{session.user.email}</span>
                <form action={async () => { "use server"; await signOut({ redirectTo: "/plan/signin" }); }}>
                  <button className={btnGhost} type="submit">{pt(lang, "action.signOut")}</button>
                </form>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </div>
        <CommandPalette projects={projects.map((p) => ({ id: p.id, name: p.name, type: p.type }))} />
      </Toaster>
    </LangProvider>
  );
}
