import { t, type Lang } from "@/lib/i18n";

export function Company({ lang }: { lang: Lang }) {
  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[var(--border)] shadow-[0_0_40px_-12px_var(--brand-accent)]">
        <iframe
          src="https://company.nanoteofficial.me"
          title="NaNote Corp — AI Company Simulator"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-[300px] md:h-[520px] border-0"
        />
      </div>
      <p className="mt-4 text-center">
        <a
          href="https://company.nanoteofficial.me"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
        >
          {t("section.company.cta", lang)}
        </a>
      </p>
    </>
  );
}
