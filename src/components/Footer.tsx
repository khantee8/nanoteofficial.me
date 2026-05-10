import { profile } from "@/lib/profile";
import { t, type Lang } from "@/lib/i18n";

export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t border-[var(--border)] mt-24">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-sm text-[var(--muted)]">
        <p>
          &copy; {new Date().getFullYear()} {profile.name.en}. {t("footer.builtWith", lang)}
        </p>
        <div className="flex gap-5">
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)]"
          >
            {t("footer.linkedin", lang)}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)]"
          >
            {t("footer.github", lang)}
          </a>
          <a href={`mailto:${profile.email}`} className="hover:text-[var(--foreground)]">
            {t("footer.email", lang)}
          </a>
        </div>
      </div>
    </footer>
  );
}
