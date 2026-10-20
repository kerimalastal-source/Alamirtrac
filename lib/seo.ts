// Open Graph and Twitter tags for a page, derived from the page's own title, description and canonical
// path, so og:url always equals the canonical URL (the root layout's og:url points at the home page).
import type { Metadata } from "next";
import { business } from "./content";

export function withSocial(meta: Metadata, type: "website" | "article" = "website"): Metadata {
  const path = typeof meta.alternates?.canonical === "string" ? meta.alternates.canonical : "/";
  const title = typeof meta.title === "string" ? `${meta.title} | ${business.nameBrand}` : `${business.fullName} | ${business.tagline}`;
  const description = typeof meta.description === "string" ? meta.description : business.description;
  // The site's share image (app/opengraph-image.tsx): a page-level openGraph replaces the layout's, so it is repeated here.
  const images = [{ url: "/opengraph-image", width: 1200, height: 630, alt: business.fullName }];
  return {
    ...meta,
    openGraph: { type, url: path, siteName: business.nameBrand, locale: "ar_EG", title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
