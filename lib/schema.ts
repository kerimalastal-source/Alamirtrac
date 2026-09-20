import { business, type Service, type BlogPost, type FaqCategory } from "@/lib/content";

const logoUrl = `${business.url}/logo.avif`;

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${business.url}/#business`,
    name: business.fullName,
    alternateName: business.nameBrand,
    description: business.description,
    url: business.url,
    telephone: business.phone,
    email: business.email,
    image: logoUrl,
    logo: logoUrl,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "البراجيل",
      addressLocality: "القاهرة",
      addressCountry: "EG",
    },
    areaServed: {
      "@type": "City",
      name: "القاهرة",
    },
    sameAs: [business.facebook, business.instagram],
  };
}

export function serviceSchema(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.title,
    name: service.title,
    description: service.description,
    url: `${business.url}/services/${service.slug}`,
    provider: {
      "@type": "LocalBusiness",
      "@id": `${business.url}/#business`,
      name: business.fullName,
      telephone: business.phone,
      url: business.url,
    },
    areaServed: {
      "@type": "City",
      name: "القاهرة",
    },
  };
}

export function blogPostingSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedDate,
    dateModified: post.publishedDate,
    mainEntityOfPage: `${business.url}/blog/${post.slug}`,
    author: {
      "@type": "Organization",
      name: business.fullName,
      url: business.url,
    },
    publisher: {
      "@type": "Organization",
      name: business.fullName,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
    },
  };
}

export function faqPageSchema(categories: FaqCategory[]) {
  const items = categories.flatMap((category) => category.items);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${business.url}${item.path}`,
    })),
  };
}
