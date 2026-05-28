import { type ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="mx-auto max-w-6xl px-6 py-20 md:py-24 scroll-mt-20"
    >
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
      <div
        data-reveal
        style={{ "--reveal-d": 240 } as React.CSSProperties}
      >
        {children}
      </div>
    </section>
  );
}
