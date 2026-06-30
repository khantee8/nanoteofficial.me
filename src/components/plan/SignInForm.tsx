"use client";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { pt } from "@/lib/plan/i18n";
import { btnPrimary, inputCls } from "./ui";

export function SignInForm({ action, lang }: { action: (fd: FormData) => Promise<void>; lang: Lang }) {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  if (sent) return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
      <p className="font-medium">{pt(lang, "signin.sentTitle")}</p>
      <p className="mt-1 text-[var(--muted)]">{pt(lang, "signin.sentDesc")}</p>
    </div>
  );
  return (
    <form
      action={async (fd) => { setPending(true); try { await action(fd); setSent(true); } finally { setPending(false); } }}
      className="flex flex-col gap-3"
    >
      <input name="email" type="email" required placeholder="you@example.com" autoFocus className={inputCls} />
      <button className={`${btnPrimary} w-full py-2`} type="submit" disabled={pending}>
        {pending ? pt(lang, "signin.sending") : pt(lang, "signin.send")}
      </button>
    </form>
  );
}
