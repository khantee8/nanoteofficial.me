import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeatureSync } from "@/components/FeatureSync";
import { BackToTop } from "@/components/BackToTop";
import { profile, pick } from "@/lib/profile";
import { getLang, t } from "@/lib/i18n";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const name = pick(profile.name, lang);
  const headline = pick(profile.headline, lang);
  const summary = pick(profile.summary, lang);
  return {
    metadataBase: new URL("https://nanoteofficial.me"),
    title: { default: `${name} — ${headline}`, template: `%s — ${name}` },
    description: summary,
    openGraph: {
      title: `${name} — ${headline}`,
      description: summary,
      type: "website",
      url: "https://nanoteofficial.me",
      locale: lang === "th" ? "th_TH" : "en_US",
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

const themeScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches))d.classList.add("dark")}catch(e){}})()`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  const name = pick(profile.name, lang);
  const headline = pick(profile.headline, lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name,
        jobTitle: headline,
        url: "https://nanoteofficial.me",
        email: profile.email,
        sameAs: [profile.linkedin, profile.github],
        alumniOf: [
          { "@type": "EducationOrganization", name: "NIDA" },
          { "@type": "EducationOrganization", name: "Khon Kaen University" },
        ],
      },
      {
        "@type": "WebSite",
        name: "nanoteofficial.me",
        url: "https://nanoteofficial.me",
      },
    ],
  };

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoThai.variable} h-full antialiased`}
    >
      <head>
        {/* Anti-FOWT: apply dark class before first paint — hardcoded script, no user input */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* JSON-LD: structured data from hardcoded profile — no user input */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <FeatureSync />
        <Header lang={lang} />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} />
        <BackToTop label={t("cta.backToTop", lang)} />
      </body>
    </html>
  );
}
