"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const VIEWS = ["table", "kanban", "calendar", "burndown"] as const;

export function ViewTabs() {
  const router = useRouter(); const path = usePathname();
  const params = useSearchParams(); const active = params.get("view") ?? "table";
  return (
    <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
      {VIEWS.map((v) => (
        <button key={v} onClick={() => router.push(`${path}?view=${v}`)}
          aria-current={active === v}
          className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feature-color)] ${
            active === v
              ? "bg-[var(--feature-color)] text-white shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}>
          {v}
        </button>
      ))}
    </div>
  );
}
