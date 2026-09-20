import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import ServiceCard from "@/components/ServiceCard";
import { services } from "@/lib/content";

export const metadata: Metadata = {
  title: "خدماتنا",
  description:
    "خدمات ALAMIR TRAC لصيانة المعدات الثقيلة والهيدروليك والمحركات والديزل وأنظمة التبريد والكهرباء وإعادة التأهيل في القاهرة.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading
        eyebrow="خدماتنا"
        title="خدمات صيانة المعدات الثقيلة والهيدروليك"
        description="فريق فني متخصص يغطي كل أنظمة المعدة الثقيلة، من الفحص الدوري إلى إعادة التأهيل الكاملة."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} detailed />
        ))}
      </div>

      <div className="mt-16 flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">غير متأكد من الخدمة التي تحتاجها؟</h2>
          <p className="mt-1 text-sm text-muted">أرسل لنا تفاصيل العطل وسيراجعها الفريق الفني ويقترح الحل المناسب.</p>
        </div>
        <Link
          href="/contact"
          className="shrink-0 rounded-md bg-accent px-6 py-3 font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
        >
          راسلنا الآن
        </Link>
      </div>
    </div>
  );
}
