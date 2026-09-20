import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import { projects } from "@/lib/content";

export const metadata: Metadata = {
  title: "من أعمالنا",
  description:
    "نماذج من أعمال ALAMIR TRAC في صيانة وإعادة تأهيل المعدات الثقيلة وأنظمة الهيدروليك والمحركات والتبريد والديزل والكهرباء.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading
        eyebrow="من أعمالنا"
        title="نماذج من أعمال الصيانة وإعادة التأهيل"
        description="أمثلة من طبيعة الأعمال التي ننفذها. القسم قابل للتحديث بصور وتفاصيل حقيقية من أرشيف الشركة."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <div key={project.slug} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="flex h-40 items-center justify-center border-b border-border bg-surface-2 text-sm text-muted">
              صورة العمل (قريباً)
            </div>
            <div className="p-6">
              <span className="text-xs font-bold text-accent">{project.category}</span>
              <h3 className="mt-2 text-lg font-bold text-foreground">{project.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{project.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
