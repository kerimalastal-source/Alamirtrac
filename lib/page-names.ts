// A page's Arabic name for the statistics page: "الرئيسية", the service's title, "مقال: …".
import { blogPosts, services } from "./content";

const PAGES: Record<string, string> = {
  "": "الرئيسية",
  about: "من نحن",
  services: "الخدمات",
  projects: "المشاريع",
  blog: "المدونة",
  faq: "الأسئلة الشائعة",
  contact: "اتصل بنا",
  lp: "صفحة طلب عرض السعر",
};

const SERVICE_BY_SLUG = new Map(services.map((s) => [s.slug, s.title]));
const POST_BY_SLUG = new Map(blogPosts.map((p) => [p.slug, p.title]));

const clip = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1)}…` : value);

export function pageName(path: string): string {
  const key = path.split(/[?#]/)[0].replace(/\/+$/, "").replace(/^\//, "");
  if (key in PAGES) return PAGES[key];
  const service = key.match(/^services\/([^/]+)$/)?.[1];
  if (service) return SERVICE_BY_SLUG.get(service) ?? "خدمة";
  const post = key.match(/^blog\/([^/]+)$/)?.[1];
  if (post) return `مقال: ${clip(POST_BY_SLUG.get(post) ?? "", 40)}`.replace(/: $/, "");
  return `‎/${key}`;
}
