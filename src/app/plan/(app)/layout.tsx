import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function PlanLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/plan/signin");

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/10">
        <Link href="/plan" className="font-semibold">Plan</Link>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/plan/signin" }); }}>
          <span className="mr-3 text-sm opacity-70">{session.user.email}</span>
          <button className="text-sm underline" type="submit">Sign out</button>
        </form>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
