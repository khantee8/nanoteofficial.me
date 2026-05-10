import Link from "next/link";
import { type RoadmapItem } from "@/lib/profile";

export function SubdomainHero({ item }: { item: RoadmapItem }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.3]" />
      <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 md:pt-28">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <span aria-hidden>←</span> Back to home
        </Link>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
          {item.subdomain}
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
          {item.title}.
        </h1>
        <p className="mt-3 text-xl text-[var(--muted)]">{item.tagline}</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/60 px-3 py-1 text-xs">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Status: {item.status}
        </div>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed">{item.description}</p>
      </div>
    </section>
  );
}

export function FeatureGrid({ features }: { features: string[] }) {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-20">
      <h2 className="text-sm uppercase tracking-[0.18em] text-[var(--accent)] font-mono mb-6">
        Planned features
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((f, i) => (
          <div
            key={f}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 p-5 flex gap-4"
          >
            <span className="font-mono text-xs text-[var(--muted)] mt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="leading-relaxed">{f}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ComingSoonCTA({ subdomain }: { subdomain: string }) {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24">
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/30 p-8 md:p-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Preview
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight">
          Coming to {subdomain}
        </h3>
        <p className="mt-2 max-w-xl mx-auto text-[var(--muted)]">
          This is a public preview of what will live on the dedicated subdomain.
          The production app will be deployed separately and linked from here.
        </p>
      </div>
    </div>
  );
}
