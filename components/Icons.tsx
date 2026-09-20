import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function WrenchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2 2.3-2.3Z" />
    </svg>
  );
}

export function HydraulicIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="4" y="9" width="10" height="6" rx="1" />
      <path d="M14 12h3a3 3 0 0 0 3-3V7" />
      <path d="M7 9V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3" />
      <path d="M8 15v3M11 15v3" />
    </svg>
  );
}

export function EngineIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="3" y="10" width="8" height="7" rx="1" />
      <path d="M11 12h3l2-2h2v3" />
      <path d="M18 13v3h2" />
      <path d="M6 10V8h3v2" />
      <circle cx="7" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DieselIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3c2.2 2.6 4 5.2 4 7.8a4 4 0 1 1-8 0C8 8.2 9.8 5.6 12 3Z" />
      <path d="M9 20h6M12 17v3" />
    </svg>
  );
}

export function CoolingIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="12" cy="12" r="1.4" />
      <path d="M12 10.6c-1.8-1.6-2-3.6-1-5.2 1.6.4 2.6 1.8 2.7 3.7" />
      <path d="M13.4 12c1.6 1.8 3.6 2 5.2 1-.4-1.6-1.8-2.6-3.7-2.7" />
      <path d="M12 13.4c1.8 1.6 2 3.6 1 5.2-1.6-.4-2.6-1.8-2.7-3.7" />
      <path d="M10.6 12c-1.6-1.8-3.6-2-5.2-1 .4 1.6 1.8 2.6 3.7 2.7" />
    </svg>
  );
}

export function ElectricIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

export function OverhaulIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 12a8 8 0 0 1 13.7-5.7M20 12a8 8 0 0 1-13.7 5.7" />
      <path d="M17 3v4h-4M7 21v-4h4" />
    </svg>
  );
}

export const serviceIcons = {
  wrench: WrenchIcon,
  hydraulic: HydraulicIcon,
  engine: EngineIcon,
  diesel: DieselIcon,
  cooling: CoolingIcon,
  electric: ElectricIcon,
  overhaul: OverhaulIcon,
};
