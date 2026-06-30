import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { btnGhost } from "@/components/plan/ui";

export default async function PlanLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/plan/signin");

  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_80%,transparent)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/plan" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--feature-color)" }} />
              Plan
            </Link>
            <Link href="/plan" className="hidden text-sm text-[var(--muted)] transition hover:text-[var(--foreground)] sm:block">
              Projects
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--muted-soft)] sm:block">{session.user.email}</span>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/plan/signin" }); }}>
              <button className={btnGhost} type="submit">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
