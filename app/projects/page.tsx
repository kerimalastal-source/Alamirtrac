import type { Metadata } from "next";
import { withSocial } from "@/lib/seo";
import SectionHeading from "@/components/SectionHeading";
import CoverIllustration from "@/components/CoverIllustration";
import { projects } from "@/lib/content";

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
        description="هذه الأمثلة توضيحية لأنواع الأعطال التي نصلحها، وليست أعمالاً لعملاء بأسمائهم. وعندما ننجز عملاً ونستأذن صاحبه سنعرضه هنا بالصور."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <div key={project.slug} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <CoverIllustration icon={project.icon} title={project.title} size="sm" className="rounded-none" />
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
