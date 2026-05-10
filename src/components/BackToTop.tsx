"use client";

import { useEffect, useState } from "react";

export function BackToTop({ label }: { label: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-5 right-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)]/85 backdrop-blur text-[var(--foreground)] shadow-lg transition-all duration-300 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
        <path
          d="M8 13V3M3 7l5-4 5 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
