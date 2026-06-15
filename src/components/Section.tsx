import { type ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  description,
  band,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  /** Full-bleed subtle surface band — alternates visual rhythm between sections. */
  band?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 ${
        band ? "bg-[var(--surface)] border-y border-[var(--border-soft)]" : ""
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="max-w-2xl mb-10">
          {eyebrow && (
            <p
              data-reveal
              style={{ "--reveal-d": 0 } as React.CSSProperties}
              className="text-xs uppercase tracking-[0.18em] text-[var(--accent)] font-mono mb-3"
            >
              {eyebrow}
            </p>
          )}
          <h2
            data-reveal
            style={{ "--reveal-d": 80 } as React.CSSProperties}
            className="text-3xl md:text-4xl font-semibold tracking-tight"
          >
            {title}
          </h2>
          {description && (
            <p
              data-reveal
              style={{ "--reveal-d": 160 } as React.CSSProperties}
              className="mt-4 text-[var(--muted)] leading-relaxed"
            >
              {description}
            </p>
          )}
        </div>
        <div data-reveal style={{ "--reveal-d": 240 } as React.CSSProperties}>
          {children}
        </div>
      </div>
    </section>
  );
}
