import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import CoverIllustration from "@/components/CoverIllustration";
import { blogPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "مقالات ونصائح صيانة المعدات الثقيلة",
  description:
    "مقالات فنية من ALAMIR TRAC حول صيانة المعدات الثقيلة، أعطال الهيدروليك، المحركات، أنظمة التبريد والصيانة الوقائية.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const sortedPosts = [...blogPosts].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));

  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading
        eyebrow="المدونة الفنية"
        title="مقالات ونصائح صيانة المعدات الثقيلة"
        description="خبرة فريقنا الفني في مقالات مبسطة تساعدك على فهم أعطال معداتك واتخاذ القرار الصحيح."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-colors hover:border-accent/50 hover:shadow-md"
          >
            <CoverIllustration icon={post.icon} title={post.title} size="sm" className="rounded-none" />
            <div className="flex flex-1 flex-col p-6">
              <span className="text-xs text-muted">
                {new Date(post.publishedDate).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · {post.minutesToRead} دقيقة قراءة
              </span>
              <h2 className="mt-3 text-lg font-bold leading-7 text-foreground">{post.title}</h2>
              <p className="mt-2 leading-6 text-muted">{post.excerpt}</p>
              <span className="mt-4 text-sm font-bold text-accent">اقرأ المقال كاملاً ←</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
