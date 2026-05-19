import Link from "next/link";
import { roadmap, pick, type RoadmapItem } from "@/lib/profile";
import { t, type Lang } from "@/lib/i18n";

const statusStyles: Record<RoadmapItem["status"], string> = {
  Planned:
    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  "In design":
    "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30",
  Prototyping:
    "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  Live: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/40",
};

export function Roadmap({ lang }: { lang: Lang }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {roadmap.map((item, i) => (
        <Link
          key={item.key}
          href={item.href}
          data-feature={item.key}
          data-reveal
          style={{ "--reveal-d": i * 100 } as React.CSSProperties}
          className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 card-hover"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full blur-2xl opacity-80"
            style={{ background: "var(--feature-tint-strong)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-0.5"
            style={{ background: "var(--feature-color)" }}
          />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p
                className="font-mono text-xs uppercase tracking-[0.18em]"
                style={{ color: "var(--feature-color-strong)" }}
              >
                {item.subdomain}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                {pick(item.title, lang)}
                <span style={{ color: "var(--feature-color)" }}>.</span>
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{pick(item.tagline, lang)}</p>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${statusStyles[item.status]}`}
            >
              {t(`status.${item.status}` as const, lang)}
            </span>
          </div>
          <p className="relative mt-5 text-sm leading-relaxed">{pick(item.description, lang)}</p>
          <ul className="relative mt-5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-[var(--muted)]">
            {item.features.map((f, i) => (
              <li key={i} className="flex gap-2">
                <span
                  aria-hidden
                  className="font-bold"
                  style={{ color: "var(--feature-color)" }}
                >
                  •
                </span>
                <span>{pick(f, lang)}</span>
              </li>
            ))}
          </ul>
          <div
            className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: "var(--feature-color-strong)" }}
          >
            {t("cta.preview", lang)}
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
