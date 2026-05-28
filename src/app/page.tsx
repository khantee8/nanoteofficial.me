import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { Company } from "@/components/Company";
import { Roadmap } from "@/components/Roadmap";
import { Experience } from "@/components/Experience";
import { Skills } from "@/components/Skills";
import { HardSkills } from "@/components/HardSkills";
import { Education } from "@/components/Education";
import { Certifications } from "@/components/Certifications";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
import { profile, pick } from "@/lib/profile";
import { getLang, t } from "@/lib/i18n";

export default async function HomePage() {
  const lang = await getLang();

  return (
    <>
      <Hero lang={lang} />

      <Section
        id="about"
        eyebrow={t("section.about.eyebrow", lang)}
        title={t("section.about.title", lang)}
        description={t("section.about.description", lang)}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {profile.about.map((p, i) => (
            <p key={i} className="text-[var(--muted)] leading-relaxed">
              {pick(p, lang)}
            </p>
          ))}
        </div>
      </Section>

      <Section
        id="company"
        eyebrow={t("section.company.eyebrow", lang)}
        title={t("section.company.title", lang)}
        description={t("section.company.description", lang)}
      >
        <Company lang={lang} />
      </Section>

      <Section
        id="experience"
        eyebrow={t("section.experience.eyebrow", lang)}
        title={t("section.experience.title", lang)}
      >
        <Experience lang={lang} />
      </Section>

      <Section
        id="projects"
        eyebrow={t("section.projects.eyebrow", lang)}
        title={t("section.projects.title", lang)}
      >
        <Projects lang={lang} />
      </Section>

      <Section
        id="education"
        eyebrow={t("section.education.eyebrow", lang)}
        title={t("section.education.title", lang)}
      >
        <Education lang={lang} />
      </Section>

      <Section
        id="hardskills"
        eyebrow={t("section.hardSkills.eyebrow", lang)}
        title={t("section.hardSkills.title", lang)}
      >
        <HardSkills lang={lang} />
      </Section>

      <Section
        id="skills"
        eyebrow={t("section.skills.eyebrow", lang)}
        title={t("section.skills.title", lang)}
      >
        <Skills lang={lang} />
      </Section>

      <Section
        id="certs"
        eyebrow={t("section.certs.eyebrow", lang)}
        title={t("section.certs.title", lang)}
      >
        <Certifications lang={lang} />
      </Section>

      <Section
        id="roadmap"
        eyebrow={t("section.roadmap.eyebrow", lang)}
        title={t("section.roadmap.title", lang)}
        description={t("section.roadmap.description", lang)}
      >
        <Roadmap lang={lang} />
      </Section>

      <Section
        id="contact"
        eyebrow={t("section.contact.eyebrow", lang)}
        title={t("section.contact.title", lang)}
      >
        <Contact lang={lang} />
      </Section>
    </>
  );
}
