import type { ServiceIcon } from "@/lib/content";
import { serviceIcons } from "@/components/Icons";

const sizes = {
  sm: { box: "h-36", ring: "h-16 w-16", icon: "h-8 w-8" },
  md: { box: "h-48 sm:h-56", ring: "h-24 w-24 sm:h-28 sm:w-28", icon: "h-11 w-11 sm:h-12 sm:w-12" },
  lg: { box: "h-56 sm:h-72", ring: "h-28 w-28 sm:h-36 sm:w-36", icon: "h-14 w-14 sm:h-16 sm:w-16" },
} as const;

export default function CoverIllustration({
  icon,
  title,
  size = "md",
  className = "",
}: {
  icon: ServiceIcon;
  title: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const Icon = serviceIcons[icon];
  const s = sizes[size];

  return (
    <div
      className={`bg-grid relative flex ${s.box} items-center justify-center overflow-hidden rounded-2xl bg-dark ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute -end-6 -top-6 h-28 w-28 text-dark-border/60 sm:h-36 sm:w-36"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="50" cy="50" r="34" />
        <circle cx="50" cy="50" r="20" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI) / 4;
          const x1 = 50 + Math.cos(angle) * 34;
          const y1 = 50 + Math.sin(angle) * 34;
          const x2 = 50 + Math.cos(angle) * 42;
          const y2 = 50 + Math.sin(angle) * 42;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </svg>

      <div
        className={`relative flex ${s.ring} items-center justify-center rounded-full bg-accent/15 text-accent`}
      >
        <Icon className={s.icon} strokeWidth={1.2} />
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}
