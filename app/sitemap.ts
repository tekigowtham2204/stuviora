import type { MetadataRoute } from "next";
import { listStudents } from "@/lib/data/queries";

const BASE = "https://stuviora.com";

/** Public, indexable surfaces (P11 / audit T1: sitemap + robots). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/how-it-works",
    "/explore",
    "/help",
    "/trust",
    "/about",
    "/legal/terms",
    "/legal/privacy",
    "/legal/refund",
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  // Public student profiles are the long-tail SEO surface.
  const students = await listStudents();
  const profiles: MetadataRoute.Sitemap = students.map((s) => ({
    url: `${BASE}/freelancer/${s.username}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...profiles];
}
