import { business, type Service, type BlogPost, type FaqCategory } from "@/lib/content";

const logoUrl = `${business.url}/logo.avif`;

const brandNameVariants = ["ALAMIR TRAC", "Alamir Trac", "الأمير تراك", "الامير تراك", "شركة الأمير"];

const egyptAreaServed = {
  "@type": "Country",
  name: "مصر",
};

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${business.url}/#business`,
    name: business.fullName,
    alternateName: brandNameVariants,
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
    areaServed: egyptAreaServed,
    sameAs: [business.facebook, business.instagram],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${business.url}/#website`,
    name: business.fullName,
    alternateName: brandNameVariants,
    url: business.url,
    inLanguage: "ar",
    publisher: {
      "@id": `${business.url}/#business`,
    },
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
    areaServed: egyptAreaServed,
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
