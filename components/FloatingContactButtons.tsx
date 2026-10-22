"use client";

import { usePathname } from "next/navigation";
import { business, services } from "@/lib/content";
import { serviceWaMessage, whatsappLink } from "@/lib/whatsapp";
import { WhatsappIcon, PhoneCallIcon, FacebookIcon, InstagramIcon } from "@/components/Icons";

const buttons = [
  {
    href: `tel:${business.phone}`,
    label: "اتصل بنا",
    className: "bg-accent hover:bg-accent-strong",
    Icon: PhoneCallIcon,
  },
  {
    href: business.whatsapp,
    label: "تواصل عبر واتساب",
    className: "bg-[#25D366] hover:bg-[#1eb955]",
    Icon: WhatsappIcon,
  },
  {
    href: business.facebook,
    label: "تابعنا على فيسبوك",
    className: "bg-[#1877F2] hover:bg-[#1465d1]",
    Icon: FacebookIcon,
  },
  {
    href: business.instagram,
    label: "تابعنا على إنستجرام",
    className: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90",
    Icon: InstagramIcon,
  },
];

export default function FloatingContactButtons() {
  const pathname = usePathname();
  const isLanding = pathname?.startsWith("/lp");
  const service = services.find((item) => pathname === `/services/${item.slug}`);
  const whatsappHref = whatsappLink(service ? serviceWaMessage(service.title) : undefined);
  const visibleButtons = (isLanding ? buttons.slice(0, 2) : buttons).map((button) =>
    button.href === business.whatsapp ? { ...button, href: whatsappHref } : button,
  );

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2.5">
      {visibleButtons.map(({ href, label, className, Icon }) => {
        const isExternal = href.startsWith("http");
        return (
          <a
            key={label}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            aria-label={label}
            title={label}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg ring-1 ring-black/5 opacity-50 transition hover:scale-110 hover:opacity-100 ${className}`}
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
}
