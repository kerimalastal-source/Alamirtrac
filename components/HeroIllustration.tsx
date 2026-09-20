import { WrenchIcon, HydraulicIcon, EngineIcon, CoolingIcon } from "@/components/Icons";

const orbit = [
  { Icon: HydraulicIcon, style: { top: "6%", insetInlineStart: "8%" } },
  { Icon: EngineIcon, style: { top: "10%", insetInlineEnd: "4%" } },
  { Icon: CoolingIcon, style: { bottom: "4%", insetInlineStart: "18%" } },
];

export default function HeroIllustration() {
  return (
    <div className="relative hidden h-80 w-80 shrink-0 items-center justify-center lg:flex xl:h-96 xl:w-96">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-dark-border" fill="none">
        <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="100" cy="100" r="66" stroke="currentColor" strokeWidth="1" />
      </svg>

      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/30 xl:h-36 xl:w-36">
        <WrenchIcon className="h-14 w-14 xl:h-16 xl:w-16" strokeWidth={1.2} />
      </div>

      {orbit.map(({ Icon, style }, index) => (
        <div
          key={index}
          style={style}
          className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-dark-elevated text-accent ring-1 ring-dark-border"
        >
          <Icon className="h-6 w-6" strokeWidth={1.4} />
        </div>
      ))}
    </div>
  );
}
