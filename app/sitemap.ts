import type { MetadataRoute } from "next";
import { business, services, blogPosts } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${business.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${business.url}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${business.url}/services`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${business.url}/projects`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${business.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${business.url}/contact`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${business.url}/services/${service.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${business.url}/blog/${post.slug}`,
    lastModified: post.publishedDate,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes];
}
