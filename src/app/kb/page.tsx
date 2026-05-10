import type { Metadata } from "next";
import { roadmap } from "@/lib/profile";
import { SubdomainHero, FeatureGrid } from "@/components/SubdomainHero";

const item = roadmap.find((r) => r.key === "kb")!;

export const metadata: Metadata = {
  title: `${item.title} — ${item.tagline}`,
  description: item.description,
  robots: { index: false, follow: false },
};

export default function KbPage() {
  return (
    <>
      <SubdomainHero item={item} />
      <section className="mx-auto max-w-md px-6 pb-12">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-7">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
            Private access
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            This knowledge base is private. Auth is not yet wired up — this is a
            visual placeholder for the planned login form.
          </p>
          <form
            className="mt-5 space-y-3"
            action="#"
            aria-label="Sign in (preview)"
          >
            <label className="block text-sm">
              <span className="text-[var(--muted)]">Email</span>
              <input
                type="email"
                disabled
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm disabled:opacity-50"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--muted)]">Password</span>
              <input
                type="password"
                disabled
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm disabled:opacity-50"
              />
            </label>
            <button
              type="button"
              disabled
              className="w-full rounded-lg bg-[var(--foreground)] text-[var(--background)] px-4 py-2 text-sm font-medium opacity-50 cursor-not-allowed"
            >
              Sign in (disabled in preview)
            </button>
          </form>
        </div>
      </section>
      <FeatureGrid features={item.features} />
    </>
  );
}
