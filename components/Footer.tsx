"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { business, services } from "@/lib/content";
import { flags, hasLegalIds } from "@/lib/flags";
import { OPEN_SETTINGS_EVENT } from "@/lib/consent";

export default function Footer() {
  const pathname = usePathname();
  const isLanding = pathname?.startsWith("/lp");

  if (isLanding) {
    return (
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-5 py-10 text-center">
          <Image src="/logo.avif" alt={business.fullName} width={358} height={192} className="h-14 w-auto" />
          <p className="text-sm text-muted">{business.address}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm">
            <a href={`tel:${business.phone}`} dir="ltr" className="text-muted transition-colors hover:text-accent">
              {business.phone}
            </a>
            <a href={`mailto:${business.email}`} dir="ltr" className="text-muted transition-colors hover:text-accent">
              {business.email}
            </a>
          </div>
          <p className="mt-2 text-xs text-muted">
            © {new Date().getFullYear()} {business.fullName} — جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image src="/logo.avif" alt={business.fullName} width={358} height={192} className="h-20 w-auto" />
          <p className="mt-3 text-sm leading-6 text-muted">{business.description}</p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold text-foreground">خدماتنا</h2>
          <ul className="space-y-0">
            {services.slice(0, 6).map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="inline-block py-2 text-sm text-muted transition-colors hover:text-accent"
                >
                  {service.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/services" className="inline-block py-2 text-sm font-bold text-accent-text hover:text-accent-strong">
                كل الخدمات ←
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold text-foreground">روابط</h2>
          <ul className="space-y-0">
            <li>
              <Link href="/about" className="inline-block py-2 text-sm text-muted transition-colors hover:text-accent">
                من نحن
              </Link>
            </li>
            <li>
              <Link href="/projects" className="inline-block py-2 text-sm text-muted transition-colors hover:text-accent">
                أعطال نتعامل معها
              </Link>
            </li>
            <li>
              <Link href="/blog" className="inline-block py-2 text-sm text-muted transition-colors hover:text-accent">
                المدونة الفنية
              </Link>
            </li>
            <li>
              <Link href="/faq" className="inline-block py-2 text-sm text-muted transition-colors hover:text-accent">
                الأسئلة الشائعة
              </Link>
            </li>
            <li>
              <Link href="/contact" className="inline-block py-2 text-sm text-muted transition-colors hover:text-accent">
                تواصل معنا
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold text-foreground">بيانات التواصل</h2>
          <ul className="space-y-0 text-sm text-muted">
            <li>
              <span className="font-bold text-foreground">الورشة: </span>
              {business.address}
            </li>
            <li>
              <span className="font-bold text-foreground">المكتب: </span>
              {business.hqAddress}
            </li>
            <li>
              <span className="font-bold text-foreground">مواعيد العمل: </span>
              {business.workingHours}
            </li>
            <li dir="ltr" className="text-right">
              <a href={`tel:${business.phone}`} className="inline-block py-1.5 transition-colors hover:text-accent">
                {business.phone}
              </a>
            </li>
            <li dir="ltr" className="text-right">
              <a href={`mailto:${business.email}`} className="inline-block py-1.5 transition-colors hover:text-accent">
                {business.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-5 py-5 text-center text-xs text-muted">
        <p>
          © {new Date().getFullYear()} {business.fullName} — جميع الحقوق محفوظة
        </p>
        {hasLegalIds && (
          <p className="mt-1">
            السجل التجاري: <span dir="ltr">{flags.commercialRegister}</span> — الرقم الضريبي: <span dir="ltr">{flags.taxId}</span>
          </p>
        )}
        {(flags.privacy || flags.warranty) && (
          <p className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {flags.privacy && (
              <Link href="/privacy" className="inline-block py-1.5 transition-colors hover:text-accent">
                سياسة الخصوصية
              </Link>
            )}
            {flags.warranty && (
              <Link href="/warranty" className="inline-block py-1.5 transition-colors hover:text-accent">
                الضمان
              </Link>
            )}
            {flags.privacy && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
                className="inline-block py-1.5 transition-colors hover:text-accent"
              >
                إعدادات الكوكيز
              </button>
            )}
          </p>
        )}
      </div>
    </footer>
  );
}
