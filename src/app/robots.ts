import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/kb", "/kb/"] },
    ],
    sitemap: "https://nanoteofficial.me/sitemap.xml",
    host: "https://nanoteofficial.me",
  };
}
