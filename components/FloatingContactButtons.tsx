import { business } from "@/lib/content";
import { WhatsappIcon, PhoneCallIcon, FacebookIcon, InstagramIcon } from "@/components/Icons";

const buttons = [
  {
    href: business.whatsapp,
    label: "تواصل عبر واتساب",
    className: "bg-[#25D366] hover:bg-[#1eb955]",
    Icon: WhatsappIcon,
  },
  {
    href: `tel:${business.phone}`,
    label: "اتصل بنا",
    className: "bg-accent hover:bg-accent-strong",
    Icon: PhoneCallIcon,
  },
  {
    href: business.instagram,
    label: "تابعنا على إنستغرام",
    className: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90",
    Icon: InstagramIcon,
  },
  {
    href: business.facebook,
    label: "تابعنا على فيسبوك",
    className: "bg-[#1877F2] hover:bg-[#1465d1]",
    Icon: FacebookIcon,
  },
];

export default function FloatingContactButtons() {
  return (
    <div className="fixed bottom-5 end-5 z-50 flex flex-col gap-3">
      {buttons.map(({ href, label, className, Icon }) => {
        const isExternal = href.startsWith("http");
        return (
          <a
            key={label}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            aria-label={label}
            title={label}
            className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg ring-1 ring-black/5 transition-transform hover:scale-110 ${className}`}
          >
            <Icon className="h-6 w-6" />
          </a>
        );
      })}
    </div>
  );
}
