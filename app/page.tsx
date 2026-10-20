import type { Metadata } from "next";
import { withSocial } from "@/lib/seo";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import HeroIllustration from "@/components/HeroIllustration";
import Image from "next/image";
import { business, services, blogPosts, workSteps } from "@/lib/content";
import { whatsappLink } from "@/lib/whatsapp";
import { PhoneCallIcon, WhatsappIcon } from "@/components/Icons";

export const metadata: Metadata = withSocial({
  description:
    "شركة الأمير (ALAMIR TRAC) لصيانة وإعادة تأهيل المعدات الثقيلة وأنظمة الهيدروليك، ورشتها في البراجيل بالجيزة وتخدم جميع المحافظات، بخبرة مؤسسها أحمد الأمير منذ عام 1997.",
  alternates: { canonical: "/" },
});

const stats = [
  { value: "منذ 1997", label: "خبرة أحمد الأمير في المعدات الثقيلة" },
  { value: `${services.length}`, label: "خدمة صيانة متخصصة" },
  { value: "كل المحافظات", label: "صيانة في موقع العمل" },
];

const whyUs = [
  {
    title: "خبرة المؤسس أحمد الأمير منذ عام 1997",
    description: "ورشة يشرف عليها مؤسسها مباشرة، وتتعامل مع أعطال المعدات الثقيلة بكل أنواعها وأنظمتها.",
  },
  {
    title: "تشخيص دقيق قبل الإصلاح",
    description: "نحدد السبب الحقيقي للعطل بدلاً من معالجة الأعراض فقط، لنوفر عليك الوقت والتكلفة.",
  },
  {
    title: "سعر واضح قبل العمل",
    description: "نكتب لك التكلفة ومدة الإصلاح قبل أن نبدأ، ولا نبدأ أي عمل قبل موافقتك.",
  },
  {
    title: "إعادة التأهيل بدلاً من الاستبدال",
    description: "نساعدك على اتخاذ القرار الأمثل بين الإصلاح الجزئي وإعادة التأهيل الكاملة.",
  },
];

const latestBlogPosts = [...blogPosts].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate)).slice(0, 4);

export default function Home() {
  return (
    <>
      <section className="bg-grid bg-dark">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-5 py-24 sm:py-32 lg:flex-row lg:justify-between">
          <div>
            <span className="text-xl font-extrabold tracking-wide text-accent sm:text-2xl">
              {business.nameBrand} — الأمير تراك
            </span>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-dark-foreground sm:text-5xl">
              صيانة هيدروليك ومعدات ثقيلة بتشخيص دقيق وسعر مكتوب قبل العمل، في الورشة أو في موقع العمل
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-dark-muted">
              ورشة «الأمير تراك» في البراجيل بالجيزة، بقيادة أحمد الأمير، بخبرة شخصية منذ عام 1997 في هيدروليك
              ومحركات المعدات الثقيلة. نشخّص العطل أولاً، ونكتب لك التكلفة ومدة الإصلاح قبل أن نبدأ.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-[#157a3f] px-6 py-3 font-bold text-white transition-colors hover:bg-[#106232]"
              >
                <WhatsappIcon className="h-5 w-5" />
                أرسل العطل على واتساب
              </a>
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-2 rounded-md border border-dark-border px-6 py-3 font-bold text-dark-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <PhoneCallIcon className="h-5 w-5" />
                اتصل الآن
              </a>
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

          <HeroIllustration />
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[auto_1fr]">
          {business.founderPhoto && (
            <Image
              src={business.founderPhoto}
              alt={`${business.founderName}، مؤسس الأمير تراك`}
              width={400}
              height={500}
              className="mx-auto h-auto w-full max-w-[400px] rounded-2xl object-cover"
            />
          )}
          <div className={business.founderPhoto ? "" : "lg:col-span-2"}>
            <span className="text-sm font-bold tracking-wide text-accent-text">المؤسس</span>
            <h2 className="mt-3 text-2xl font-extrabold text-foreground sm:text-3xl">
              {business.founderName}، مؤسس الأمير تراك
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
              منذ عام 1997 وهو يفتح مضخات وصمامات وأسطوانات الهيدروليك في الحفارات واللوادر والبلدوزرات. وأسّس
              «الأمير تراك» ليقدّم العمل الذي يتقنه بطريقته: تشخيص قبل الإصلاح، وكلام واضح في التكلفة قبل أي عمل.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="خدماتنا"
            title="حلول صيانة شاملة لمعداتك الثقيلة"
            description="نغطي كل أنظمة المعدة الثقيلة بفريق فني واحد، من الفحص الدوري إلى إعادة التأهيل الكاملة."
          />
          <Link href="/services" className="inline-block py-2 text-sm font-bold text-accent-text hover:text-accent-strong">
            كل الخدمات ←
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionHeading eyebrow="كيف نعمل" title="من اتصالك الأول حتى استلام معدتك" />
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {workSteps.map((step, index) => (
              <li key={step} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-base font-extrabold text-accent-text">
                  {index + 1}
                </span>
                <p className="mt-4 leading-7 text-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div>
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
          <Link href="/blog" className="inline-block py-2 text-sm font-bold text-accent-text hover:text-accent-strong">
            كل المقالات ←
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {latestBlogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-accent/50"
            >
              <h3 className="text-base font-bold leading-6 text-foreground">{post.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{post.excerpt}</p>
              <span className="mt-4 text-sm font-bold text-accent-text">اقرأ المزيد ←</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-accent">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-accent-foreground">تواجه عطلاً في إحدى معداتك الثقيلة؟</h2>
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
