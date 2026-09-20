import Link from "next/link";
import type { Service } from "@/lib/content";
import { serviceIcons } from "@/components/Icons";

export default function ServiceCard({ service, detailed }: { service: Service; detailed?: boolean }) {
  const Icon = serviceIcons[service.icon];

  return (
    <div
      id={service.slug}
      className="group scroll-mt-24 rounded-2xl border border-border bg-surface p-6 shadow-sm transition-colors hover:border-accent/50 hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">{service.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{service.short}</p>

      {detailed && (
        <>
          <p className="mt-4 text-sm leading-6 text-muted">{service.description}</p>
          <ul className="mt-4 space-y-2">
            {service.points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
        </>
      )}

      {!detailed && (
        <Link
          href={`/services#${service.slug}`}
          className="mt-4 inline-block text-sm font-bold text-accent transition-colors hover:text-accent-strong"
        >
          التفاصيل ←
        </Link>
      )}
    </div>
  );
}
