"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";

export type NavItem = { href: string; id: string; label: string };

type Ctx = {
  items: NavItem[];
  active: string | null;
  open: boolean;
  setOpen: (v: boolean) => void;
  email: string;
  ctaLabel: string;
  closeLabel: string;
  menuLabel: string;
};

const HeaderNavContext = createContext<Ctx | null>(null);

function useHeaderNav() {
  const ctx = useContext(HeaderNavContext);
  if (!ctx) throw new Error("HeaderNav components must be inside HeaderNavRoot");
  return ctx;
}

export function HeaderNavRoot({
  items,
  email,
  ctaLabel,
  closeLabel,
  menuLabel,
  children,
}: {
  items: NavItem[];
  email: string;
  ctaLabel: string;
  closeLabel: string;
  menuLabel: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const value = useMemo<Ctx>(
    () => ({ items, active, open, setOpen, email, ctaLabel, closeLabel, menuLabel }),
    [items, active, open, email, ctaLabel, closeLabel, menuLabel],
  );

  return (
    <HeaderNavContext.Provider value={value}>
      {children}
      <MobileSheet />
    </HeaderNavContext.Provider>
  );
}

export function HeaderNavLinks() {
  const { items, active } = useHeaderNav();
  return (
    <nav className="hidden lg:flex items-center gap-6 text-sm text-[var(--muted)]">
      {items.map((n) => {
        const isActive = active === n.id;
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={isActive ? "page" : undefined}
            className={`relative transition-colors hover:text-[var(--foreground)] ${
              isActive ? "text-[var(--foreground)]" : ""
            }`}
          >
            {n.label}
            <span
              aria-hidden
              className={`absolute -bottom-1 left-0 right-0 h-px origin-left transition-transform duration-300 ${
                isActive ? "scale-x-100" : "scale-x-0"
              }`}
              style={{ background: "var(--brand-accent)" }}
            />
          </Link>
        );
      })}
    </nav>
  );
}

export function HeaderNavTrigger() {
  const { open, setOpen, menuLabel } = useHeaderNav();
  return (
    <button
      type="button"
      aria-label={menuLabel}
      aria-expanded={open}
      aria-controls="mobile-nav-sheet"
      onClick={() => setOpen(true)}
      className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--brand-accent)] transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
        <path
          d="M2 4h12M2 8h12M2 12h12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

function MobileSheet() {
  const { items, active, open, setOpen, email, ctaLabel, closeLabel, menuLabel } =
    useHeaderNav();

  return (
    <div
      id="mobile-nav-sheet"
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-sm"
      />
      <div
        className={`absolute right-0 top-0 h-full w-[min(86vw,360px)] bg-[var(--background)] border-l border-[var(--border)] shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-[var(--border-soft)]">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            {menuLabel}
          </span>
          <button
            type="button"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] hover:border-[var(--brand-accent)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path
                d="M3 3l8 8M11 3l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="space-y-1">
            {items.map((n) => {
              const isActive = active === n.id;
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center justify-between rounded-lg px-3 py-3 text-base transition-colors ${
                      isActive
                        ? "bg-[var(--surface)] text-[var(--foreground)]"
                        : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span>{n.label}</span>
                    <span
                      aria-hidden
                      className={`h-1.5 w-1.5 rounded-full transition-opacity ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                      style={{ background: "var(--brand-accent)" }}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="px-5 pb-6 pt-2 border-t border-[var(--border-soft)]">
          <a
            href={`mailto:${email}`}
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 rounded-full bg-[var(--brand-accent)] text-white px-4 py-2.5 text-sm font-semibold shadow-[0_2px_10px_color-mix(in_oklab,var(--brand-accent)_30%,transparent)] hover:brightness-110 transition-all"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
