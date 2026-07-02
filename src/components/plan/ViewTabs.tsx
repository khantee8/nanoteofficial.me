"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { usePlanT } from "./LangContext";
import type { PlanKey } from "@/lib/plan/i18n";

const VIEWS = ["table", "kanban", "gantt", "burndown", "calendar"] as const;

const icon = "h-3.5 w-3.5";
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" } as const;
const ICONS: Record<(typeof VIEWS)[number], ReactNode> = {
  table: <svg viewBox="0 0 24 24" {...stroke} className={icon} aria-hidden><path d="M4 6h16M4 12h16M4 18h16" /></svg>,
  kanban: <svg viewBox="0 0 24 24" {...stroke} className={icon} aria-hidden><path d="M5 4v16M12 4v10M19 4v13" /></svg>,
  calendar: <svg viewBox="0 0 24 24" {...stroke} className={icon} aria-hidden><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>,
  gantt: <svg viewBox="0 0 24 24" {...stroke} className={icon} aria-hidden><path d="M4 6h8M8 12h10M6 18h7" /></svg>,
  burndown: <svg viewBox="0 0 24 24" {...stroke} className={icon} aria-hidden><path d="M4 5l6 7 4-3 6 8" /></svg>,
};

export function ViewTabs() {
  const router = useRouter(); const path = usePathname();
  const params = useSearchParams(); const active = params.get("view") ?? "table";
  const { t } = usePlanT();
  return (
    <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
      {VIEWS.map((v) => (
        <button key={v} onClick={() => router.push(`${path}?view=${v}`)}
          aria-current={active === v}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feature-color)] ${
            active === v
              ? "bg-[var(--feature-color)] text-[var(--feature-contrast)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}>
          {ICONS[v]}
          <span className="hidden sm:inline">{t(`view.${v}` as PlanKey)}</span>
        </button>
      ))}
    </div>
  );
}
