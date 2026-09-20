import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services, business } from "@/lib/content";
import ServiceHero from "@/components/ServiceHero";
import { serviceIcons, WhatsappIcon } from "@/components/Icons";
import JsonLd from "@/components/JsonLd";
import { serviceSchema, breadcrumbSchema } from "@/lib/schema";

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
  return {
    title: service.title,
    description: service.metaDescription ?? service.description,
    alternates: { canonical: `/services/${service.slug}` },
  };
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
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{service.description}</p>

      <div className="mt-10 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
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

      <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl bg-accent p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-accent-foreground">تحتاج هذه الخدمة؟</h2>
          <p className="mt-1 text-sm text-accent-foreground/85">
            أرسل لنا تفاصيل العطل أو المعدة وسيتواصل معك فريقنا الفني لتحديد الموعد المناسب.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3">
          <Link
            href="/contact"
            className="rounded-md bg-dark px-6 py-3 text-center font-bold text-dark-foreground transition-colors hover:bg-dark-elevated"
          >
            اطلب الخدمة الآن
          </Link>
          <a
            href={business.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 py-3 font-bold text-white transition-colors hover:bg-[#1eb955]"
          >
            <WhatsappIcon className="h-5 w-5" />
            تواصل معنا عبر واتساب
          </a>
        </div>
      </div>

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
