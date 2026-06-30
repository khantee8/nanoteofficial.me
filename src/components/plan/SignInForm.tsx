"use client";
import { useState } from "react";

export function SignInForm({ action }: { action: (fd: FormData) => Promise<void> }) {
  const [sent, setSent] = useState(false);
  if (sent) return <p className="text-sm">Check your email for a sign-in link.</p>;
  return (
    <form
      action={async (fd) => { await action(fd); setSent(true); }}
      className="flex flex-col gap-3"
    >
      <input
        name="email" type="email" required placeholder="you@example.com"
        className="rounded-md border border-black/15 px-3 py-2 dark:border-white/15 bg-transparent"
      />
      <button className="rounded-md bg-[var(--feature-color)] px-3 py-2 text-white" type="submit">
        Send magic link
      </button>
    </form>
  );
}
