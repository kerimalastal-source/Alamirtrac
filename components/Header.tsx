import Image from "next/image";
import Link from "next/link";
import { business, services } from "@/lib/content";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/services", label: "خدماتنا" },
  { href: "/projects", label: "أعمالنا" },
  { href: "/blog", label: "المدونة" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-dark-border bg-dark/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.avif"
            alt={business.fullName}
            width={358}
            height={192}
            priority
            className="h-11 w-auto sm:h-12"
          />
          <span className="hidden text-xs text-dark-muted sm:inline">{business.nameAr}</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/" className="text-sm text-dark-muted transition-colors hover:text-dark-foreground">
            الرئيسية
          </Link>

          <div className="group relative">
            <Link
              href="/services"
              className="inline-flex items-center gap-1 text-sm text-dark-muted transition-colors hover:text-dark-foreground"
            >
              خدماتنا
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 transition-transform group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Link>

            <div className="invisible absolute end-0 top-full z-50 grid w-[34rem] grid-cols-2 gap-x-4 gap-y-1 rounded-xl border border-dark-border bg-dark p-3 opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="rounded-lg px-3 py-2 text-sm text-dark-muted transition-colors hover:bg-dark-elevated hover:text-dark-foreground"
                >
                  {service.title}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/projects" className="text-sm text-dark-muted transition-colors hover:text-dark-foreground">
            أعمالنا
          </Link>
          <Link href="/blog" className="text-sm text-dark-muted transition-colors hover:text-dark-foreground">
            المدونة
          </Link>
          <Link href="/contact" className="text-sm text-dark-muted transition-colors hover:text-dark-foreground">
            تواصل معنا
          </Link>
        </nav>

        <Link
          href="/contact"
          className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
        >
          اطلب صيانة
        </Link>
      </div>

      <nav className="flex items-center gap-5 overflow-x-auto border-t border-dark-border px-5 py-2 md:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 text-sm text-dark-muted transition-colors hover:text-dark-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
