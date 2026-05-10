import { profile } from "@/lib/profile";

export function Contact() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/40 p-8 md:p-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">
          Got a project, a question, or a portfolio to review?
        </h3>
        <p className="mt-2 text-[var(--muted)]">
          The fastest way to reach me is email. I usually reply within a day.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] text-[var(--background)] px-5 py-2.5 text-sm font-medium hover:opacity-90"
        >
          {profile.email}
        </a>
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium hover:border-[var(--accent)]"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
}
