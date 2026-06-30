"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const VIEWS = ["table", "kanban", "calendar"] as const;
export function ViewTabs() {
  const router = useRouter(); const path = usePathname();
  const params = useSearchParams(); const active = params.get("view") ?? "table";
  return (
    <div className="mb-4 flex gap-1">
      {VIEWS.map((v) => (
        <button key={v} onClick={() => router.push(`${path}?view=${v}`)}
          className={`rounded-md px-3 py-1 text-sm capitalize ${active === v ? "bg-[var(--feature-color)] text-white" : "border border-black/10 dark:border-white/10"}`}>
          {v}
        </button>
      ))}
    </div>
  );
}
