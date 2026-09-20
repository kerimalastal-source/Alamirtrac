import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import JsonLd from "@/components/JsonLd";
import { faqPageSchema, breadcrumbSchema } from "@/lib/schema";
import { faqCategories } from "@/lib/content";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description:
    "إجابات على أكثر الأسئلة شيوعاً حول خدمات ALAMIR TRAC في صيانة وإعادة تأهيل المعدات الثقيلة وأنظمة الهيدروليك، وطريقة طلب الخدمة والتواصل معنا في القاهرة.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-20">
      <JsonLd data={faqPageSchema(faqCategories)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "الرئيسية", path: "/" },
          { name: "الأسئلة الشائعة", path: "/faq" },
        ])}
      />

      <SectionHeading
        as="h1"
        eyebrow="الأسئلة الشائعة"
        title="إجابات على أكثر الأسئلة تكراراً"
        description="مجموعة من الأسئلة التي يطرحها عملاؤنا غالباً حول خدماتنا وطريقة العمل، مقسّمة إلى ثلاثة محاور لتسهيل الوصول للإجابة."
      />

      <div className="mt-14 space-y-14">
        {faqCategories.map((category, index) => (
          <div key={category.title}>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-extrabold text-accent">
                {index + 1}
              </span>
              <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">{category.title}</h2>
            </div>

            <div className="mt-6 space-y-3">
              {category.items.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-border bg-surface p-5 open:border-accent/40 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-foreground marker:content-none">
                    {item.question}
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 shrink-0 text-accent transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>
                  <p className="mt-3 leading-7 text-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">لم تجد إجابة سؤالك؟</h2>
          <p className="mt-1 text-sm text-muted">تواصل معنا مباشرة وسيسعدنا الرد على استفسارك بالتفصيل.</p>
        </div>
        <Link
          href="/contact"
          className="shrink-0 rounded-md bg-accent px-6 py-3 font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
        >
          تواصل معنا
        </Link>
      </div>
    </div>
  );
}
