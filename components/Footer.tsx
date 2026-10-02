"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { business, services } from "@/lib/content";

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
          <h3 className="mb-3 text-sm font-bold text-foreground">خدماتنا</h3>
          <ul className="space-y-2">
            {services.slice(0, 6).map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="text-sm text-muted transition-colors hover:text-accent"
                >
                  {service.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/services" className="text-sm font-bold text-accent hover:text-accent-strong">
                كل الخدمات ←
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-foreground">روابط</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="text-sm text-muted transition-colors hover:text-accent">
                من نحن
              </Link>
            </li>
            <li>
              <Link href="/projects" className="text-sm text-muted transition-colors hover:text-accent">
                من أعمالنا
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-sm text-muted transition-colors hover:text-accent">
                المدونة الفنية
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-sm text-muted transition-colors hover:text-accent">
                الأسئلة الشائعة
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-muted transition-colors hover:text-accent">
                تواصل معنا
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-foreground">بيانات التواصل</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>{business.address}</li>
            <li dir="ltr" className="text-right">
              <a href={`tel:${business.phone}`} className="transition-colors hover:text-accent">
                {business.phone}
              </a>
            </li>
            <li dir="ltr" className="text-right">
              <a href={`mailto:${business.email}`} className="transition-colors hover:text-accent">
                {business.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-5 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {business.fullName} — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
