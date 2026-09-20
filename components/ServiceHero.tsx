import type { ServiceIcon } from "@/lib/content";
import { serviceIcons } from "@/components/Icons";

export default function ServiceHero({ icon, title }: { icon: ServiceIcon; title: string }) {
  const Icon = serviceIcons[icon];

  return (
    <div className="bg-grid relative flex h-56 items-center justify-center overflow-hidden rounded-3xl bg-dark sm:h-72">
      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-accent/15 text-accent sm:h-36 sm:w-36">
        <Icon className="h-14 w-14 sm:h-16 sm:w-16" strokeWidth={1.2} />
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}
