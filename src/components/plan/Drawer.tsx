"use client";
import { useEffect, type ReactNode } from "react";

export function Drawer({
  open, onClose, title, children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
      <button aria-label="Close" onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] motion-safe:animate-[fadeIn_.15s_ease]" />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--background)] shadow-xl motion-safe:animate-[slideIn_.2s_ease]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
          <h2 className="font-medium tracking-tight">{title}</h2>
          <button onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
      <style>{`
        @keyframes slideIn { from { transform: translateX(16px); opacity: .6 } to { transform: none; opacity: 1 } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-[slideIn"], [class*="animate-[fadeIn"] { animation: none !important }
        }
      `}</style>
    </div>
  );
}
