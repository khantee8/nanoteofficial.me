import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { profile, pick } from "@/lib/profile";
import { getLang } from "@/lib/i18n";

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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} ${notoThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header lang={lang} />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
