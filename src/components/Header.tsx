import Link from "next/link";
import { profile } from "@/lib/profile";

const nav = [
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/#roadmap", label: "Roadmap" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_25%,transparent)]"
          />
          {profile.handle}
          <span className="text-[var(--muted)] font-normal">.me</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-[var(--muted)]">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="hover:text-[var(--foreground)] transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <a
          href={`mailto:${profile.email}`}
          className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3.5 py-1.5 text-sm hover:border-[var(--accent)] transition-colors"
        >
          Hire me
        </a>
      </div>
    </header>
  );
}
