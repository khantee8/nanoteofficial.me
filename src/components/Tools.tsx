import { tools, pick, type ToolItem } from "@/lib/profile";
import { t, type Lang } from "@/lib/i18n";
import { ArrowRight } from "@/components/icons";

const maturityStyles: Record<ToolItem["maturity"], string> = {
  production:
    "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  minimal:
    "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30",
  shell:
    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
};

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden className="shrink-0">
      <path
        d="M3.5 5V3.5a2.5 2.5 0 015 0V5M2.5 5h7v5h-7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Tools({ lang }: { lang: Lang }) {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        {tools.map((tool, i) => (
          <article
            key={tool.key}
            data-reveal
            style={{ "--reveal-d": i * 80 } as React.CSSProperties}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 card-hover"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-60"
              style={{ background: "var(--brand-accent)" }}
            />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-xl font-semibold tracking-tight">
                  {pick(tool.name, lang)}
                </h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {pick(tool.tagline, lang)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${maturityStyles[tool.maturity]}`}
              >
                {t(`tools.maturity.${tool.maturity}` as const, lang)}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed">{pick(tool.purpose, lang)}</p>

            <ul className="mt-5 flex flex-wrap gap-1.5">
              {tool.stack.map((s) => (
                <li
                  key={s}
                  className="rounded-md border border-[var(--border-soft)] px-2 py-0.5 font-mono text-[11px] text-[var(--muted)]"
                >
                  {s}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                {tool.repoVisibility === "private" && <LockIcon />}
                {t(`tools.repo.${tool.repoVisibility}` as const, lang)}
              </span>

              {tool.href ? (
                <a
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:brightness-110"
                  style={{ color: "var(--brand-accent)" }}
                >
                  {t("tools.open", lang)}
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </a>
              ) : (
                <span className="text-sm text-[var(--muted)]">
                  {t("tools.internalOnly", lang)}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      <p className="mt-6 text-xs text-[var(--muted)]">{t("tools.footnote", lang)}</p>
    </>
  );
}
