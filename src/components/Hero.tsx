import Link from "next/link";
import { profile } from "@/lib/profile";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.35]" />
      <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent)] mb-5">
          {profile.location} &middot; available for hire
        </p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-4xl">
          {profile.name}.
          <span className="block text-[var(--muted)] mt-2">{profile.headline}.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-[var(--muted)] leading-relaxed">
          {profile.summary}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/#roadmap"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] text-[var(--background)] px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            See the roadmap
            <span aria-hidden>→</span>
          </Link>
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium hover:border-[var(--accent)] transition-colors"
          >
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}
