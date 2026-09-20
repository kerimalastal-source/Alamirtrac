import { business, services, blogPosts, projects, faqCategories } from "@/lib/content";

export type SearchItem = {
  title: string;
  description: string;
  url: string;
  category: string;
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[ً-ْ]/g, "")
    .trim();
}

const pageItems: SearchItem[] = [
  { title: "الرئيسية", description: business.tagline, url: "/", category: "الصفحات" },
  { title: "من نحن", description: "قصة الشركة ورسالتنا وقيمنا في العمل", url: "/about", category: "الصفحات" },
  { title: "خدماتنا", description: "كل خدمات صيانة المعدات الثقيلة والهيدروليك", url: "/services", category: "الصفحات" },
  { title: "من أعمالنا", description: "نماذج من أعمال الصيانة وإعادة التأهيل", url: "/projects", category: "الصفحات" },
  { title: "المدونة الفنية", description: "مقالات ونصائح صيانة المعدات الثقيلة", url: "/blog", category: "الصفحات" },
  { title: "الأسئلة الشائعة", description: "إجابات على أكثر الأسئلة تكراراً", url: "/faq", category: "الصفحات" },
  { title: "تواصل معنا", description: "أرسل طلب الصيانة الآن", url: "/contact", category: "الصفحات" },
];

const serviceItems: SearchItem[] = services.map((service) => ({
  title: service.title,
  description: service.short,
  url: `/services/${service.slug}`,
  category: "الخدمات",
}));

const blogItems: SearchItem[] = blogPosts.map((post) => ({
  title: post.title,
  description: post.excerpt,
  url: `/blog/${post.slug}`,
  category: "المدونة",
}));

const projectItems: SearchItem[] = projects.map((project) => ({
  title: project.title,
  description: project.description,
  url: "/projects",
  category: "أعمالنا",
}));

const faqItems: SearchItem[] = faqCategories.flatMap((category) =>
  category.items.map((item) => ({
    title: item.question,
    description: item.answer,
    url: "/faq",
    category: "الأسئلة الشائعة",
  }))
);

export const searchIndex: SearchItem[] = [
  ...pageItems,
  ...serviceItems,
  ...blogItems,
  ...projectItems,
  ...faqItems,
];

export function searchSite(query: string, limit = 8): SearchItem[] {
  const q = normalize(query);
  if (!q) return [];

  const scored = searchIndex
    .map((item) => {
      const title = normalize(item.title);
      const description = normalize(item.description);
      let score = -1;
      if (title.startsWith(q)) score = 3;
      else if (title.includes(q)) score = 2;
      else if (description.includes(q)) score = 1;
      return { item, score };
    })
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ item }) => item);
}
