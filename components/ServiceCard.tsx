import Link from "next/link";
import type { Service } from "@/lib/content";
import { serviceIcons } from "@/components/Icons";

export default function ServiceCard({ service }: { service: Service }) {
  const Icon = serviceIcons[service.icon];

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-colors hover:border-accent/50 hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">{service.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{service.short}</p>
      <span className="mt-4 text-sm font-bold text-accent">التفاصيل ←</span>
    </Link>
  );
}
