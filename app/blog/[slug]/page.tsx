import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, postRelations, serviceBlogLinks, services } from "@/lib/content";
import ArticleBody from "@/components/ArticleBody";
import { withSocial } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";
import JsonLd from "@/components/JsonLd";
import PostCover from "@/components/PostCover";
import { WhatsappIcon } from "@/components/Icons";
import { blogPostingSchema, breadcrumbSchema, faqPageSchema } from "@/lib/schema";

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
  return withSocial(
    {
      title: post.seoTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt,
      alternates: { canonical: `/blog/${post.slug}` },
    },
    "article",
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) notFound();

  const relatedPosts = (postRelations[slug] ?? [])
    .map((relatedSlug) => blogPosts.find((item) => item.slug === relatedSlug))
    .filter((item): item is (typeof blogPosts)[number] => Boolean(item));
  const relatedService = services.find((item) => (serviceBlogLinks[item.slug] ?? []).includes(slug));

  return (
    <article className="mx-auto max-w-3xl px-5 py-20">
      <JsonLd data={blogPostingSchema(post)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "الرئيسية", path: "/" },
          { name: "المدونة الفنية", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <Link href="/blog" className="inline-block py-2 text-sm font-bold text-accent-text hover:text-accent-strong">
        ← كل المقالات
      </Link>

      <div className="mt-6">
        <PostCover post={post} size="md" priority />
      </div>

      <span className="mt-6 block text-sm text-muted">
        {new Date(post.publishedDate).toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        · {post.minutesToRead} دقيقة قراءة
        {post.author && <> · بقلم {post.author}</>}
      </span>
      <h1 className="mt-3 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
        {post.title}
      </h1>

      <ArticleBody content={post.content} />

      {post.faqs && post.faqs.length > 0 && (
        <section className="mt-14">
          <JsonLd data={faqPageSchema([{ title: post.title, items: post.faqs }])} />
          <h2 className="text-2xl font-extrabold text-foreground">أسئلة شائعة</h2>
          <div className="mt-5 space-y-3">
            {post.faqs.map((item) => (
              <details key={item.question} className="rounded-xl border border-border bg-surface p-5">
                <summary className="cursor-pointer text-lg font-bold text-foreground">{item.question}</summary>
                <p className="mt-3 text-base leading-8 text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {relatedPosts.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-bold text-foreground">اقرأ أيضاً</h2>
          <ul className="mt-4 space-y-3">
            {relatedPosts.map((item) => (
              <li key={item.slug}>
                <Link href={`/blog/${item.slug}`} className="font-bold text-accent-text hover:text-accent-strong">
                  {item.title} ←
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-16 rounded-2xl border border-border bg-surface p-6 sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-foreground">عندك العطل ده؟ أرسل صورته على واتساب</h2>
          <p className="mt-1 text-sm text-muted">فريق ALAMIR TRAC يراجع العطل ويقترح الحل المناسب قبل أي تكلفة.</p>
          {relatedService && (
            <Link href={`/services/${relatedService.slug}`} className="inline-block py-2 mt-2 text-sm font-bold text-accent-text hover:text-accent-strong">
              {relatedService.title} ←
            </Link>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:mt-0">
          <Link
            href="/contact"
            className="rounded-md bg-accent px-5 py-2.5 text-center font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
          >
            تواصل معنا
          </Link>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md bg-[#157a3f] px-5 py-2.5 font-bold text-white transition-colors hover:bg-[#106232]"
          >
            <WhatsappIcon className="h-5 w-5" />
            تواصل عبر واتساب
          </a>
        </div>
      </div>
    </article>
  );
}
