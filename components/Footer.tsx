import Image from "next/image";
import Link from "next/link";
import { business, services } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="border-t border-dark-border bg-dark">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image src="/logo.avif" alt={business.fullName} width={358} height={192} className="h-12 w-auto" />
          <p className="mt-3 text-sm leading-6 text-dark-muted">{business.description}</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-dark-foreground">خدماتنا</h3>
          <ul className="space-y-2">
            {services.slice(0, 6).map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="text-sm text-dark-muted transition-colors hover:text-accent"
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
          <h3 className="mb-3 text-sm font-bold text-dark-foreground">روابط</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/projects" className="text-sm text-dark-muted transition-colors hover:text-accent">
                من أعمالنا
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-sm text-dark-muted transition-colors hover:text-accent">
                المدونة الفنية
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-dark-muted transition-colors hover:text-accent">
                تواصل معنا
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-dark-foreground">بيانات التواصل</h3>
          <ul className="space-y-2 text-sm text-dark-muted">
            <li>{business.address}</li>
            <li dir="ltr" className="text-right">
              <a href={`mailto:${business.email}`} className="transition-colors hover:text-accent">
                {business.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-dark-border px-5 py-5 text-center text-xs text-dark-muted">
        © {new Date().getFullYear()} {business.fullName} — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
