"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlanT } from "./LangContext";

type SidebarProject = { id: string; name: string; color: string };

export function PlanSidebar({ projects, isAdmin, email, langToggle, signOut }: {
  projects: SidebarProject[];
  isAdmin: boolean;
  email: string;
  langToggle: ReactNode;
  signOut: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { t } = usePlanT();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const item = (active: boolean) =>
    `flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition ${
      active
        ? "bg-[color-mix(in_srgb,var(--feature-color)_12%,transparent)] font-medium text-[var(--foreground)]"
        : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
    }`;

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_80%,transparent)] px-4 backdrop-blur lg:hidden">
        <button aria-label={t("nav.menu")} onClick={() => setOpen(true)}
          className="rounded-md p-1.5 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            className="h-5 w-5" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <Link href="/plan" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--feature-color)" }} /> Plan
        </Link>
      </div>

      {/* Backdrop (mobile drawer) */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--border)] bg-[var(--surface)] transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:shrink-0 lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-full flex-col gap-4 p-4">
          <Link href="/plan" onClick={() => setOpen(false)} className="flex items-center gap-2 px-1 font-semibold tracking-tight">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--feature-color)" }} /> Plan
          </Link>
          <nav className="space-y-0.5">
            <Link href="/plan" onClick={() => setOpen(false)} className={item(path === "/plan")}>{t("nav.projects")}</Link>
            {isAdmin && <Link href="/plan/admin" onClick={() => setOpen(false)} className={item(path === "/plan/admin")}>{t("nav.admin")}</Link>}
          </nav>
          {projects.length > 0 && (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-0.5">
                {projects.map((p) => (
                  <Link key={p.id} href={`/plan/${p.id}`} onClick={() => setOpen(false)} className={item(path.startsWith(`/plan/${p.id}`))}>
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
                    <span className="truncate">{p.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="mt-auto space-y-3 border-t border-[var(--border)] pt-3">
            <span className="hidden items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--muted-soft)] lg:inline-flex">
              <kbd className="font-sans">⌘</kbd><kbd className="font-sans">K</kbd>
            </span>
            <div className="flex items-center justify-between gap-2">
              {langToggle}
              {signOut}
            </div>
            <div className="truncate text-xs text-[var(--muted-soft)]" title={email}>{email}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
