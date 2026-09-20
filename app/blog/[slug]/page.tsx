import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/content";
import JsonLd from "@/components/JsonLd";
import CoverIllustration from "@/components/CoverIllustration";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/schema";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) notFound();

  const paragraphs = post.content.split("\n").filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-5 py-20">
      <JsonLd data={blogPostingSchema(post)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "الرئيسية", path: "/" },
          { name: "المدونة", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <Link href="/blog" className="text-sm font-bold text-accent hover:text-accent-strong">
        ← كل المقالات
      </Link>

      <div className="mt-6">
        <CoverIllustration icon={post.icon} title={post.title} size="md" />
      </div>

      <span className="mt-6 block text-sm text-muted">
        {new Date(post.publishedDate).toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        · {post.minutesToRead} دقيقة قراءة
      </span>
      <h1 className="mt-3 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
        {post.title}
      </h1>

      <div className="mt-10 space-y-5 text-lg leading-9 text-foreground/90">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-surface p-6 sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-foreground">تحتاج فحصاً فنياً لمعدتك؟</h2>
          <p className="mt-1 text-sm text-muted">فريق ALAMIR TRAC جاهز لمراجعة العطل واقتراح الحل المناسب.</p>
        </div>
        <Link
          href="/contact"
          className="mt-4 inline-block rounded-md bg-accent px-5 py-2.5 font-bold text-accent-foreground transition-colors hover:bg-accent-strong sm:mt-0"
        >
          تواصل معنا
        </Link>
      </div>
    </article>
  );
}
