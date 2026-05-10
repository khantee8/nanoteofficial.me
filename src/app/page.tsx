import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { Roadmap } from "@/components/Roadmap";
import { Experience } from "@/components/Experience";
import { Skills } from "@/components/Skills";
import { Contact } from "@/components/Contact";
import { profile } from "@/lib/profile";

export default function HomePage() {
  return (
    <>
      <Hero />

      <Section
        id="about"
        eyebrow="About"
        title="Two disciplines, one mindset."
        description="I treat security and personal finance as the same kind of problem: identify exposure, decide what's worth defending, then build systems that hold up when conditions change."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {profile.about.map((p) => (
            <p key={p} className="text-[var(--muted)] leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </Section>

      <Section
        id="roadmap"
        eyebrow="Roadmap"
        title="What I'm building."
        description="Four projects, each with its own subdomain. The first two are the work I sell. The third I keep for myself. The fourth is for the part of me the others don't reach."
      >
        <Roadmap />
      </Section>

      <Section
        id="experience"
        eyebrow="Experience"
        title="Where I've worked."
        description="A mix of cybersecurity engineering roles and independent financial consulting. Replace the placeholders in src/lib/profile.ts with your real history."
      >
        <Experience />
      </Section>

      <Section eyebrow="Skills" title="What I bring.">
        <Skills />
      </Section>

      <Section id="contact" eyebrow="Contact" title="Let's talk.">
        <Contact />
      </Section>
    </>
  );
}
