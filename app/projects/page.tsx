import type { Metadata } from "next";
import { withSocial } from "@/lib/seo";
import SectionHeading from "@/components/SectionHeading";
import CoverIllustration from "@/components/CoverIllustration";
import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { projects } from "@/lib/content";

// صورة كل عطل: public/images/projects/<slug>.jpg؛ وإذا لم تُرفع بعد يُعرض الرسم التوضيحي.
const hasImage = (slug: string) => existsSync(path.join(process.cwd(), "public", "images", "projects", `${slug}.jpg`));

export const metadata: Metadata = withSocial({
  title: "أعطال شائعة في المعدات الثقيلة وكيف نتعامل معها",
  description:
    "أمثلة توضيحية على أنواع الأعطال التي تعالجها ALAMIR TRAC في المعدات الثقيلة: الهيدروليك والمحركات والتبريد والكهرباء.",
  alternates: { canonical: "/projects" },
});

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading
        as="h1"
        eyebrow="أعطال نتعامل معها"
        title="أعطال شائعة في المعدات الثقيلة وكيف نتعامل معها"
        description="هذه الأمثلة توضيحية لأنواع الأعطال التي نصلحها."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <div key={project.slug} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            {hasImage(project.slug) ? (
              <Image
                src={`/images/projects/${project.slug}.jpg`}
                alt={project.title}
                width={1280}
                height={720}
                className="aspect-video w-full object-cover"
              />
            ) : (
              <CoverIllustration icon={project.icon} title={project.title} size="sm" className="rounded-none" />
            )}
            <div className="p-6">
              <span className="text-xs font-bold text-accent-text">{project.category}</span>
              <h2 className="mt-2 text-lg font-bold text-foreground">{project.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{project.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
