import { profile } from "@/lib/profile";
import { t, type Lang } from "@/lib/i18n";
import { ContactForm } from "@/components/ContactForm";

export function Contact({ lang }: { lang: Lang }) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">
            {t("contact.cta.title", lang)}
          </h3>
          <p className="mt-2 text-[var(--muted)]">{t("contact.cta.description", lang)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-accent)] text-[var(--feature-contrast)] px-5 py-2.5 text-sm font-semibold shadow-[0_2px_10px_color-mix(in_oklab,var(--brand-accent)_30%,transparent)] hover:brightness-110 transition-all"
          >
            {profile.email}
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium hover:border-[var(--accent)]"
          >
            {t("cta.linkedin", lang)}
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10">
        <h3 className="text-lg font-semibold tracking-tight mb-1">
          {t("contact.form.title", lang)}
        </h3>
        <p className="text-sm text-[var(--muted)] mb-6">
          {t("contact.form.subtitle", lang)}
        </p>
        <ContactForm lang={lang} />
      </div>
    </div>
  );
}
