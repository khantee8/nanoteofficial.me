import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { SignInForm } from "@/components/plan/SignInForm";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/plan");
  async function action(fd: FormData) {
    "use server";
    await signIn("resend", { email: String(fd.get("email")), redirectTo: "/plan" });
  }
  return (
    <div className="mx-auto mt-24 max-w-sm px-6">
      <h1 className="mb-4 text-xl font-semibold">Sign in to Plan</h1>
      <SignInForm action={action} />
    </div>
  );
}
