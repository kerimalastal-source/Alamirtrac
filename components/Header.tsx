"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteSearch from "@/components/SiteSearch";
import { MenuIcon, CloseIcon, PhoneCallIcon, ChartIcon, WhatsappIcon, FacebookIcon, InstagramIcon } from "@/components/Icons";
import { business, services } from "@/lib/content";
import { whatsappLink } from "@/lib/whatsapp";

const socialLinks = [
  { href: whatsappLink(), label: "تواصل عبر واتساب", Icon: WhatsappIcon, className: "bg-[#157a3f] hover:bg-[#106232]" },
  { href: business.facebook, label: "تابعنا على فيسبوك", Icon: FacebookIcon, className: "bg-[#1877F2] hover:bg-[#1465d1]" },
  {
    href: business.instagram,
    label: "تابعنا على إنستغرام",
    Icon: InstagramIcon,
    className: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90",
  },
];

function SocialLinks({ size }: { size: string }) {
  return (
    <>
      {socialLinks.map(({ href, label, Icon, className }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={`flex ${size} shrink-0 items-center justify-center rounded-full text-white transition-transform hover:scale-110 ${className}`}
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </>
  );
}

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/about", label: "من نحن" },
  { href: "/services", label: "خدماتنا" },
  { href: "/projects", label: "أعطال نتعامل معها" },
  { href: "/blog", label: "المدونة الفنية" },
  { href: "/faq", label: "الأسئلة الشائعة" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname?.startsWith("/lp");

  if (isLanding) {
    return (
      <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3 xl:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/logo.avif"
              alt={business.fullName}
              width={358}
              height={192}
              priority
              className="h-14 w-auto sm:h-16"
            />
          </Link>

          <a
            href={`tel:${business.phone}`}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong sm:px-6"
          >
            <PhoneCallIcon className="h-4 w-4" />
            اتصل بنا الآن
          </a>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3 xl:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.avif"
            alt={business.fullName}
            width={358}
            height={192}
            priority
            className="h-16 w-auto sm:h-20"
          />
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          <Link href="/" className="whitespace-nowrap text-[15px] font-semibold text-foreground transition-colors hover:text-accent">
            الرئيسية
          </Link>
          <Link href="/about" className="whitespace-nowrap text-[15px] font-semibold text-foreground transition-colors hover:text-accent">
            من نحن
          </Link>

          <div className="group relative">
            <Link
              href="/services"
              className="inline-flex items-center gap-1 whitespace-nowrap text-[15px] font-semibold text-foreground transition-colors hover:text-accent"
            >
              خدماتنا
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 transition-transform group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Link>

            <div className="invisible absolute left-1/2 top-full z-50 grid w-[34rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 grid-cols-2 gap-x-4 gap-y-1 rounded-xl border border-border bg-surface p-3 opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-2 hover:text-accent"
                >
                  {service.title}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/projects" className="whitespace-nowrap text-[15px] font-semibold text-foreground transition-colors hover:text-accent">
            أعطال نتعامل معها
          </Link>
          <Link href="/blog" className="whitespace-nowrap text-[15px] font-semibold text-foreground transition-colors hover:text-accent">
            المدونة الفنية
          </Link>
          <Link href="/faq" className="whitespace-nowrap text-[15px] font-semibold text-foreground transition-colors hover:text-accent">
            الأسئلة الشائعة
          </Link>
          <Link href="/contact" className="whitespace-nowrap text-[15px] font-semibold text-foreground transition-colors hover:text-accent">
            تواصل معنا
          </Link>
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <SiteSearch compact />
          <div className="hidden items-center gap-1.5 2xl:flex">
            <SocialLinks size="h-8 w-8" />
          </div>
          <Link
            href="/admin/stats"
            aria-label="إحصاءات الزوار"
            title="إحصاءات الزوار"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <ChartIcon className="h-5 w-5" />
          </Link>
          <a
            href={`tel:${business.phone}`}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-accent px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <PhoneCallIcon className="h-4 w-4" />
            اتصل بنا
          </a>
          <Link
            href="/contact"
            className="shrink-0 whitespace-nowrap rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
          >
            اطلب صيانة
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={mobileOpen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-surface-2 xl:hidden"
        >
          {mobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="space-y-4 border-t border-border px-5 py-4 xl:hidden">
          <SiteSearch className="w-full" />

          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-semibold text-foreground transition-colors hover:bg-surface-2 hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-center gap-3">
            <SocialLinks size="h-11 w-11" />
          </div>

          <Link
            href="/admin/stats"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-bold text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <ChartIcon className="h-5 w-5" />
            إحصاءات الزوار
          </Link>

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="block rounded-md bg-accent px-4 py-3 text-center text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
          >
            اطلب صيانة عبر واتساب
          </a>
        </div>
      )}
    </header>
  );
}
