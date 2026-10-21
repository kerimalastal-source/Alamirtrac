import type { Metadata } from "next";
import { withSocial } from "@/lib/seo";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import { services } from "@/lib/content";
import { whatsappLink } from "@/lib/whatsapp";
import { WhatsappIcon } from "@/components/Icons";

export const metadata: Metadata = withSocial({
  title: "خدمات صيانة المعدات الثقيلة والهيدروليك",
  description:
    "خدمات ALAMIR TRAC لصيانة المعدات الثقيلة: الهيدروليك، المحركات، الديزل، التبريد، الكهرباء، المجنزرات، ناقل الحركة، اللحام، والصيانة الطارئة، من ورشتنا في البراجيل بالجيزة أو في موقع العمل بجميع المحافظات.",
  alternates: { canonical: "/services" },
});

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading
        as="h1"
        eyebrow="خدماتنا"
        title="خدمات صيانة المعدات الثقيلة والهيدروليك"
        description="فريق فني متخصص يغطي كل أنظمة المعدة الثقيلة، من الفحص الدوري إلى إعادة التأهيل الكاملة. اختر الخدمة لمعرفة تفاصيلها."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} as="h2" />
        ))}
      </div>

      <div className="mt-16 flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">غير متأكد من الخدمة التي تحتاجها؟</h2>
          <p className="mt-1 text-sm text-muted">أرسل لنا تفاصيل العطل وسيراجعها الفريق الفني ويقترح الحل المناسب.</p>
          <Link
            href="/blog/choose-heavy-equipment-repair-workshop-giza"
            className="inline-block py-2 mt-2 text-sm font-bold text-accent-text hover:text-accent-strong"
          >
            كيف تختار ورشة صيانة معدات ثقيلة في الجيزة؟ ←
          </Link>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md bg-[#157a3f] px-6 py-3 font-bold text-white transition-colors hover:bg-[#106232]"
          >
            <WhatsappIcon className="h-5 w-5" />
            تواصل عبر واتساب
          </a>
          <Link
            href="/contact"
            className="rounded-md bg-accent px-6 py-3 text-center font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
          >
            راسلنا الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
