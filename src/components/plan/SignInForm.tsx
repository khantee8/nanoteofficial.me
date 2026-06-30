"use client";
import { useState } from "react";
import { btnPrimary, inputCls } from "./ui";

export function SignInForm({ action }: { action: (fd: FormData) => Promise<void> }) {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  if (sent) return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
      <p className="font-medium">Check your inbox</p>
      <p className="mt-1 text-[var(--muted)]">We sent you a sign-in link. It may take a moment to arrive.</p>
    </div>
  );
  return (
    <form
      action={async (fd) => { setPending(true); try { await action(fd); setSent(true); } finally { setPending(false); } }}
      className="flex flex-col gap-3"
    >
      <input name="email" type="email" required placeholder="you@example.com" autoFocus className={inputCls} />
      <button className={`${btnPrimary} w-full py-2`} type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
