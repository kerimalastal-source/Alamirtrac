import type { Metadata } from "next";
import { withSocial } from "@/lib/seo";
import { Suspense } from "react";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";
import { business } from "@/lib/content";
import { whatsappLink } from "@/lib/whatsapp";
import { WhatsappIcon, FacebookIcon, InstagramIcon } from "@/components/Icons";

const socialButtons = [
  { href: whatsappLink(), label: "واتساب", Icon: WhatsappIcon, className: "bg-[#157a3f] hover:bg-[#106232]" },
  { href: business.facebook, label: "فيسبوك", Icon: FacebookIcon, className: "bg-[#1877F2] hover:bg-[#1465d1]" },
  {
    href: business.instagram,
    label: "إنستغرام",
    Icon: InstagramIcon,
    className: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90",
  },
];

export const metadata: Metadata = withSocial({
  title: "تواصل معنا واطلب الصيانة",
  description:
    "تواصل مع ALAMIR TRAC في البراجيل بالجيزة لطلبات صيانة وإعادة تأهيل المعدات الثقيلة وأنظمة الهيدروليك والمحركات والديزل والتبريد والكهرباء.",
  alternates: { canonical: "/contact" },
});

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(business.mapQuery)}&output=embed`;

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading
        as="h1"
        eyebrow="تواصل معنا"
        title="أرسل طلب الصيانة الآن"
        description="شارك تفاصيل العطل وسيتواصل معك فريقنا الفني لمراجعة الحالة وتحديد الخدمة المناسبة."
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-bold text-foreground">البريد الإلكتروني</h2>
            <a
              href={`mailto:${business.email}`}
              dir="ltr"
              className="mt-2 block text-right text-accent-text transition-colors hover:text-accent-strong"
            >
              {business.email}
            </a>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-bold text-foreground">تابعنا وتواصل معنا</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {socialButtons.map(({ href, label, Icon, className }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 ${className}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-bold text-foreground">مواقعنا</h2>
            <div className="mt-3">
              <span className="text-xs font-bold text-accent-text">الورشة</span>
              <p className="mt-1 text-muted">
                <a href={business.workshopMapUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent-text hover:underline">
                  {business.address}
                </a>
              </p>
              <a
                href={business.workshopMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-2 mt-1 text-sm font-bold text-accent-text hover:text-accent-strong"
              >
                لوكيشن الورشة ←
              </a>
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <span className="text-xs font-bold text-accent-text">المكتب</span>
              <p className="mt-1 text-muted">
                <a href={business.officeMapUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent-text hover:underline">
                  {business.hqAddress}
                </a>
              </p>
              <a
                href={business.officeMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-2 mt-1 text-sm font-bold text-accent-text hover:text-accent-strong"
              >
                لوكيشن المكتب ←
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-bold text-foreground">مواعيد العمل</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{business.workingHours}. الجمعة إجازة.</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-bold text-foreground">مجالات الصيانة</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              المعدات الثقيلة، الهيدروليك، المحركات، حقن الديزل، أنظمة التبريد، الأنظمة الكهربائية، وإعادة التأهيل الشاملة.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-bold text-foreground">عندك سؤال قبل التواصل؟</h2>
            <p className="mt-2 text-sm leading-6 text-muted">راجع صفحة الأسئلة الشائعة، فربما تجد إجابتك مباشرة.</p>
            <Link href="/faq" className="inline-block py-2 mt-3 text-sm font-bold text-accent-text hover:text-accent-strong">
              الأسئلة الشائعة ←
            </Link>
            <Link
              href="/blog/choose-heavy-equipment-repair-workshop-giza"
              className="inline-block py-2 mt-2 text-sm font-bold text-accent-text hover:text-accent-strong"
            >
              كيف تختار ورشة صيانة معدات ثقيلة في الجيزة؟ ←
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <iframe
          title={`موقع الورشة على الخريطة - ${business.address}`}
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
