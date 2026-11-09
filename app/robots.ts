import type { MetadataRoute } from "next";
import { generateSitemaps } from "@/app/sitemap";
import { absoluteUrl } from "@/lib/site";

// Search and form pages are endless query-string variations: keep crawlers on the real pages.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const files = await generateSitemaps();
  return { rules: { userAgent: "*", allow: "/", disallow: ["/search", "/write-a-review", "/suggest-an-edit", "/claim"] }, sitemap: files.map(({ id }) => absoluteUrl(`/sitemap/${id}.xml`)) };
}
