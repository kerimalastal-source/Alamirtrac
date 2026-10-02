import type { MetadataRoute } from "next";
import { business } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: `${business.url}/sitemap.xml`,
  };
}
