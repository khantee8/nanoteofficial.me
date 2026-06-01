"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLang } from "@/lib/lang-action";
import type { Lang } from "@/lib/i18n";

export function LangToggle({ current }: { current: Lang }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const choose = (lang: Lang) => {
    if (lang === current) return;
    startTransition(async () => {
      await setLang(lang);
      router.refresh();
    });
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--background)] p-0.5 text-xs font-medium"
    >
      {(["en", "th"] as const).map((l) => {
        const active = l === current;
        return (
          <button
            key={l}
            type="button"
            onClick={() => choose(l)}
            disabled={pending}
            aria-pressed={active}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              active
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            } disabled:opacity-60`}
          >
            {l === "en" ? "EN" : "TH"}
          </button>
        );
      })}
    </div>
  );
}
