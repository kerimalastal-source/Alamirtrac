"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SiteSearch from "@/components/SiteSearch";
import { MenuIcon, CloseIcon } from "@/components/Icons";
import { business, services } from "@/lib/content";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/about", label: "من نحن" },
  { href: "/services", label: "خدماتنا" },
  { href: "/projects", label: "أعمالنا" },
  { href: "/blog", label: "المدونة" },
  { href: "/faq", label: "الأسئلة الشائعة" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.avif"
            alt={business.fullName}
            width={358}
            height={192}
            priority
            className="h-16 w-auto sm:h-20"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-base font-semibold text-foreground transition-colors hover:text-accent">
            الرئيسية
          </Link>
          <Link href="/about" className="text-base font-semibold text-foreground transition-colors hover:text-accent">
            من نحن
          </Link>

          <div className="group relative">
            <Link
              href="/services"
              className="inline-flex items-center gap-1 text-base font-semibold text-foreground transition-colors hover:text-accent"
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

            <div className="invisible absolute end-0 top-full z-50 grid w-[34rem] grid-cols-2 gap-x-4 gap-y-1 rounded-xl border border-border bg-surface p-3 opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
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

          <Link href="/projects" className="text-base font-semibold text-foreground transition-colors hover:text-accent">
            أعمالنا
          </Link>
          <Link href="/blog" className="text-base font-semibold text-foreground transition-colors hover:text-accent">
            المدونة
          </Link>
          <Link href="/faq" className="text-base font-semibold text-foreground transition-colors hover:text-accent">
            الأسئلة الشائعة
          </Link>
          <Link href="/contact" className="text-base font-semibold text-foreground transition-colors hover:text-accent">
            تواصل معنا
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <SiteSearch className="w-56" />
          <Link
            href="/contact"
            className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
          >
            اطلب صيانة
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-surface-2 md:hidden"
        >
          {mobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="space-y-4 border-t border-border px-5 py-4 md:hidden">
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

          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="block rounded-md bg-accent px-4 py-3 text-center text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
          >
            اطلب صيانة
          </Link>
        </div>
      )}
    </header>
  );
}
