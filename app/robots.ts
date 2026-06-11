import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Portals and APIs are private; keep crawlers on the public site.
        disallow: [
          "/student/",
          "/client/",
          "/admin/",
          "/university/",
          "/api/",
          "/messages",
          "/settings",
          "/disputes",
          "/data-privacy",
        ],
      },
    ],
    sitemap: "https://stuviora.com/sitemap.xml",
  };
}
