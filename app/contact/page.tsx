import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";
import { business } from "@/lib/content";

export const metadata: Metadata = {
  title: "تواصل معنا واطلب الصيانة",
  description:
    "تواصل مع ALAMIR TRAC في البراجيل، القاهرة لطلبات صيانة وإعادة تأهيل المعدات الثقيلة وأنظمة الهيدروليك والمحركات والديزل والتبريد والكهرباء.",
  alternates: { canonical: "/contact" },
};

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(business.mapQuery)}&output=embed`;

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading
        eyebrow="تواصل معنا"
        title="أرسل طلب الصيانة الآن"
        description="شارك تفاصيل العطل وسيتواصل معك فريقنا الفني لمراجعة الحالة وتحديد الخدمة المناسبة."
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContactForm />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="font-bold text-foreground">البريد الإلكتروني</h3>
            <a
              href={`mailto:${business.email}`}
              dir="ltr"
              className="mt-2 block text-right text-accent transition-colors hover:text-accent-strong"
            >
              {business.email}
            </a>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="font-bold text-foreground">موقع العمل</h3>
            <p className="mt-2 text-muted">{business.address}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="font-bold text-foreground">مجالات الصيانة</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              المعدات الثقيلة، الهيدروليك، المحركات، حقن الديزل، أنظمة التبريد، الأنظمة الكهربائية، وإعادة التأهيل الشاملة.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <iframe
          title={`موقعنا على الخريطة - ${business.address}`}
          src={mapSrc}
          className="h-80 w-full sm:h-96"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
