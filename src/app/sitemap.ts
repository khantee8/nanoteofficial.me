import type { MetadataRoute } from "next";

const BASE = "https://nanoteofficial.me";
const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/finance`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/cyber`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/art`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
