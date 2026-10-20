import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services, business, blogPosts, serviceBlogLinks, workSteps } from "@/lib/content";
import { withSocial } from "@/lib/seo";
import { serviceWaMessage, whatsappLink } from "@/lib/whatsapp";
import ServiceHero from "@/components/ServiceHero";
import { serviceIcons, WhatsappIcon, PhoneCallIcon } from "@/components/Icons";
import JsonLd from "@/components/JsonLd";
import { serviceSchema, breadcrumbSchema, faqPageSchema } from "@/lib/schema";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) return {};
  return withSocial({
    title: `${service.title} في الجيزة والبراجيل`,
    description: `${service.title} للحفارات واللوادر والمعدات الثقيلة في البراجيل بالجيزة. تشخيص قبل الإصلاح وسعر مكتوب قبل العمل. اتصل على ${business.phoneLocal}.`,
    alternates: { canonical: `/services/${service.slug}` },
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();

  const relatedServices = services.filter((item) => item.slug !== slug).slice(0, 3);
  const relatedPosts = (serviceBlogLinks[slug] ?? [])
    .map((postSlug) => blogPosts.find((post) => post.slug === postSlug))
    .filter((post): post is (typeof blogPosts)[number] => Boolean(post));
  const audience = service.audience ?? "لأصحاب الحفارات واللوادر والبلدوزرات في الجيزة والقاهرة وجميع المحافظات.";
  const card = "mt-10 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8";

  return (
    <article className="mx-auto max-w-4xl px-5 py-16 sm:py-20">
      <JsonLd data={serviceSchema(service)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "الرئيسية", path: "/" },
          { name: "خدماتنا", path: "/services" },
          { name: service.title, path: `/services/${service.slug}` },
        ])}
      />
      <Link href="/services" className="text-sm font-bold text-accent hover:text-accent-strong">
        ← كل الخدمات
      </Link>

      <div className="mt-6">
        <ServiceHero icon={service.icon} title={service.title} />
      </div>

      <h1 className="mt-8 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
        {service.title}
      </h1>
      <p className="mt-3 text-base font-bold text-accent">{audience}</p>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{service.description}</p>

      {service.symptoms && service.symptoms.length > 0 && (
        <div className={card}>
          <h2 className="text-lg font-bold text-foreground">علامات تدل على أن معدتك تحتاج إلى هذه الخدمة</h2>
          <ul className="mt-4 space-y-3">
            {service.symptoms.map((symptom) => (
              <li key={symptom} className="flex items-start gap-2 text-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {symptom}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={card}>
        <h2 className="text-lg font-bold text-foreground">ماذا نقدّم ضمن هذه الخدمة</h2>
        <ul className="mt-4 space-y-3">
          {service.points.map((point) => (
            <li key={point} className="flex items-start gap-2 text-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {service.notes && (
        <div className={card}>
          <h2 className="text-lg font-bold text-foreground">{service.notes.title}</h2>
          <dl className="mt-4 space-y-4">
            {service.notes.rows.map((row) => (
              <div key={row.label}>
                <dt className="text-sm font-bold text-accent">{row.label}</dt>
                <dd className="mt-1 leading-7 text-foreground">{row.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className={card}>
        <h2 className="text-lg font-bold text-foreground">كيف نعمل</h2>
        <ol className="mt-4 space-y-4">
          {workSteps.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-extrabold text-accent">
                {index + 1}
              </span>
              <span className="pt-0.5 leading-7 text-foreground">{step}</span>
            </li>
          ))}
        </ol>
        <h3 className="mt-6 text-sm font-bold text-foreground">أين نعمل؟</h3>
        <p className="mt-1 text-sm leading-7 text-muted">
          في ورشتنا في البراجيل بالجيزة، أو في موقع عملك في أي محافظة. فبعض الأعطال يمكن معالجتها ميدانياً، وبعضها
          يحتاج إلى الورشة، ونحدد ذلك بعد التشخيص الأولي.
        </p>
      </div>

      {service.faqs && service.faqs.length > 0 && (
        <div className={card}>
          <JsonLd data={faqPageSchema([{ title: service.title, items: service.faqs }])} />
          <h2 className="text-lg font-bold text-foreground">أسئلة شائعة عن هذه الخدمة</h2>
          <div className="mt-4 space-y-3">
            {service.faqs.map((item) => (
              <details key={item.question} className="rounded-xl border border-border bg-background p-4">
                <summary className="cursor-pointer font-bold text-foreground">{item.question}</summary>
                <p className="mt-2 leading-7 text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl bg-accent p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-accent-foreground">تحتاج هذه الخدمة؟</h2>
          <p className="mt-1 text-sm text-accent-foreground/85">
            أرسل لنا تفاصيل العطل أو المعدة وسيتواصل معك فريقنا الفني لتحديد الموعد المناسب.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3">
          <Link
            href={service.ctaLabel ? `/contact?service=${encodeURIComponent(service.title)}` : "/contact"}
            className="rounded-md bg-dark px-6 py-3 text-center font-bold text-dark-foreground transition-colors hover:bg-dark-elevated"
          >
            {service.ctaLabel ?? "اطلب الخدمة الآن"}
          </Link>
          <a
            href={whatsappLink(serviceWaMessage(service.title))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 py-3 font-bold text-white transition-colors hover:bg-[#1eb955]"
          >
            <WhatsappIcon className="h-5 w-5" />
            تواصل معنا عبر واتساب
          </a>
          <a
            href={`tel:${business.phone}`}
            className="flex items-center justify-center gap-2 rounded-md border border-accent-foreground/40 px-6 py-3 font-bold text-accent-foreground transition-colors hover:bg-accent-foreground/10"
          >
            <PhoneCallIcon className="h-5 w-5" />
            اتصل الآن
          </a>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="mt-14">
          <h2 className="text-lg font-bold text-foreground">مقالات فنية عن هذه الخدمة</h2>
          <ul className="mt-5 space-y-3">
            {relatedPosts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="font-bold text-accent hover:text-accent-strong">
                  {post.title} ←
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-14">
        <h2 className="text-lg font-bold text-foreground">خدمات أخرى قد تهمك</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {relatedServices.map((related) => {
            const Icon = serviceIcons[related.icon];
            return (
              <Link
                key={related.slug}
                href={`/services/${related.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-accent/50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="mt-3 text-sm font-bold text-foreground">{related.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </article>
  );
}
