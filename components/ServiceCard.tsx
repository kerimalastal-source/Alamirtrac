import Link from "next/link";
import type { Service } from "@/lib/content";
import { serviceIcons } from "@/components/Icons";

export default function ServiceCard({ service, as: Heading = "h3" }: { service: Service; as?: "h2" | "h3" }) {
  const Icon = serviceIcons[service.icon];

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-colors hover:border-accent/50 hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-accent-text transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <Heading className="mt-4 text-lg font-bold text-foreground">{service.title}</Heading>
      <p className="mt-2 text-sm leading-6 text-muted">{service.short}</p>
      <span className="mt-4 text-sm font-bold text-accent-text">التفاصيل ←</span>
    </Link>
  );
}
