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
    <section id={id} className="mx-auto max-w-6xl px-6 py-20 md:py-24 scroll-mt-20">
      <div className="max-w-2xl mb-10">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)] font-mono mb-3">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-4 text-[var(--muted)] leading-relaxed">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
