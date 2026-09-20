import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import { business, services, blogPosts } from "@/lib/content";

const stats = [
  { value: "+30", label: "عاماً من الخبرة" },
  { value: "7", label: "مجالات صيانة متخصصة" },
  { value: "القاهرة", label: "مقر العمل الرئيسي" },
];

const whyUs = [
  {
    title: "خبرة تراكمية تتجاوز 30 عاماً",
    description: "فريق فني متمرّس على أعطال المعدات الثقيلة بكل أنواعها وأنظمتها.",
  },
  {
    title: "تشخيص دقيق قبل الإصلاح",
    description: "نحدد السبب الحقيقي للعطل بدل معالجة الأعراض فقط، لتوفير وقتك وتكلفتك.",
  },
  {
    title: "تغطية شاملة لكل الأنظمة",
    description: "من المحرك والهيدروليك إلى التبريد والديزل والكهرباء، في مكان واحد.",
  },
  {
    title: "إعادة تأهيل بدل الاستبدال",
    description: "نساعدك على اتخاذ القرار الأمثل بين الإصلاح الجزئي وإعادة التأهيل الكاملة.",
  },
];

export default function Home() {
  return (
    <>
      <section className="bg-grid bg-dark">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:py-32">
          <span className="text-sm font-bold tracking-wide text-accent">
            {business.nameBrand} — القاهرة
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-dark-foreground sm:text-5xl">
            صيانة وإعادة تأهيل المعدات الثقيلة وأنظمة الهيدروليك
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-dark-muted">{business.description}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-md bg-accent px-6 py-3 font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
            >
              اطلب صيانة الآن
            </Link>
            <Link
              href="/services"
              className="rounded-md border border-dark-border px-6 py-3 font-bold text-dark-foreground transition-colors hover:border-accent hover:text-accent"
            >
              تصفح خدماتنا
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 border-t border-dark-border pt-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-3xl font-extrabold text-accent sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-dark-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHeading
          eyebrow="خدماتنا"
          title="حلول صيانة شاملة لمعداتك الثقيلة"
          description="نغطي كل أنظمة المعدة الثقيلة بفريق فني واحد، من الفحص الدوري إلى إعادة التأهيل الكاملة."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionHeading eyebrow="لماذا ALAMIR TRAC" title="خبرة ميدانية تحمي معداتك من التوقف" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {whyUs.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="المدونة الفنية" title="مقالات ونصائح فنية" />
          <Link href="/blog" className="text-sm font-bold text-accent hover:text-accent-strong">
            كل المقالات ←
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-accent/50"
            >
              <h3 className="text-base font-bold leading-6 text-foreground">{post.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{post.excerpt}</p>
              <span className="mt-4 text-sm font-bold text-accent">اقرأ المزيد ←</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-accent">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-accent-foreground">عندك عطل في معدة ثقيلة؟</h2>
            <p className="mt-2 text-accent-foreground/85">
              تواصل معنا الآن وسيراجع فريقنا الفني حالة العطل والخدمة المطلوبة.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 rounded-md bg-dark px-6 py-3 font-bold text-dark-foreground transition-colors hover:bg-dark-elevated"
          >
            اطلب صيانة الآن
          </Link>
        </div>
      </section>
    </>
  );
}
