import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { getLang } from "@/lib/i18n";
import { pt } from "@/lib/plan/i18n";
import { SignInForm } from "@/components/plan/SignInForm";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/plan");
  const lang = await getLang();
  async function action(fd: FormData) {
    "use server";
    await signIn("resend", { email: String(fd.get("email")), redirectTo: "/plan" });
  }
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--background)] px-6 text-[var(--foreground)]">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--feature-color)" }} />
          <span className="text-lg font-semibold tracking-tight">Plan</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{pt(lang, "signin.title")}</h1>
        <p className="mb-6 mt-1 text-sm text-[var(--muted)]">{pt(lang, "signin.desc")}</p>
        <SignInForm action={action} lang={lang} />
      </div>
    </div>
  );
}
