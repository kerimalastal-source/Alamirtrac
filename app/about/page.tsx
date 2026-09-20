import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import CoverIllustration from "@/components/CoverIllustration";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { business, services } from "@/lib/content";
import { serviceIcons } from "@/components/Icons";

export const metadata: Metadata = {
  title: "من نحن",
  description:
    "تعرّف على شركة الأمير (ALAMIR TRAC)، خبرة تتجاوز 30 عاماً في صيانة وإعادة تأهيل المعدات الثقيلة وأنظمة الهيدروليك في القاهرة، ورسالتنا وقيمنا في العمل.",
  alternates: { canonical: "/about" },
};

const stats = [
  { value: "+30", label: "عاماً من الخبرة الميدانية" },
  { value: `${services.length}`, label: "خدمة صيانة متخصصة" },
  { value: "القاهرة", label: "مقر العمل الرئيسي" },
];

const values = [
  {
    title: "الدقة الفنية قبل السرعة",
    description:
      "نحدد السبب الحقيقي للعطل أولاً عبر تشخيص دقيق، بدلاً من التسرع في استبدال قطع سليمة لا تحتاج إلى تغيير.",
  },
  {
    title: "شفافية كاملة مع العميل",
    description:
      "نوضح حالة المعدة والخيارات المتاحة بصراحة، ليقرر صاحب المعدة بنفسه بين الإصلاح الجزئي وإعادة التأهيل الشاملة.",
  },
  {
    title: "استجابة ميدانية سريعة",
    description:
      "فريقنا الفني جاهز للوصول إلى موقع العمل عند الحاجة، لتقليل وقت توقف المعدة إلى أقل حد ممكن.",
  },
  {
    title: "التزام بجودة ما بعد الإصلاح",
    description:
      "مسؤوليتنا لا تنتهي عند تسليم المعدة، بل نتابع أداءها للتأكد من استقرار الإصلاح على المدى الطويل.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <JsonLd
        data={breadcrumbSchema([
          { name: "الرئيسية", path: "/" },
          { name: "من نحن", path: "/about" },
        ])}
      />

      <section className="bg-grid bg-dark">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <span className="text-sm font-bold tracking-wide text-accent">من نحن</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-dark-foreground sm:text-5xl">
            خبرة تتجاوز 30 عاماً في صيانة المعدات الثقيلة وأنظمة الهيدروليك
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-dark-muted">
            شركة الأمير (ALAMIR TRAC) اسم موثوق في مجال صيانة وإعادة تأهيل المعدات الثقيلة في القاهرة.
            خبرتنا الميدانية تراكمت على مدى أكثر من ثلاثين عاماً من العمل المباشر مع مختلف أنواع
            المعدات الثقيلة وأنظمتها الفنية، لنقدم اليوم حلول صيانة تعيد لمعداتكم كفاءتها التشغيلية
            وتحميكم من التوقف غير المخطط له.
          </p>

          <div className="mt-14 grid grid-cols-3 gap-6 border-t border-dark-border pt-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-3xl font-extrabold text-accent sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-dark-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="قصتنا" title="من ورشة متخصصة في الهيدروليك إلى خبرة شاملة في المعدات الثقيلة" />
            <p className="mt-5 leading-8 text-muted">
              بدأت رحلتنا في إصلاح الأعطال الهيدروليكية، وتوسّعت خبرتنا تدريجياً لتغطي كل الأنظمة
              الأساسية في المعدات الثقيلة: المحركات، أنظمة التبريد، حقن الديزل، الأنظمة الكهربائية،
              المجنزرات، وناقل الحركة. على مدى العقود الثلاثة الماضية، تعاملنا مع آلاف الحالات
              الفنية المختلفة، ما مكّننا من بناء منهجية تشخيص دقيقة تفرّق بين العرض الظاهر والسبب
              الحقيقي للعطل، وهو ما ينعكس مباشرة على جودة الإصلاح وطول عمر المعدة بعده.
            </p>
            <p className="mt-4 leading-8 text-muted">
              رسالتنا أن نكون الشريك الفني الأول لأصحاب المعدات الثقيلة في القاهرة ومحيطها، من خلال
              صيانة موثوقة تقوم على التشخيص الدقيق قبل أي تدخل، وشفافية كاملة في تقييم الأعطال
              وتكلفة الإصلاح، حتى يتخذ العميل قراره وهو مطمئن لحالة معدّته ولما ينتظره من عمل فني.
            </p>
          </div>
          <CoverIllustration icon="overhaul" title="خبرة ALAMIR TRAC في إعادة تأهيل المعدات الثقيلة" size="lg" />
        </div>
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionHeading eyebrow="قيمنا" title="ما يوجّه عملنا في كل حالة صيانة" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {values.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHeading eyebrow="مجالات خبرتنا" title="نغطي كل أنظمة المعدة الثقيلة بفريق فني واحد" />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = serviceIcons[service.icon];
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/50 hover:bg-surface-2"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-foreground">{service.title}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-accent">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-accent-foreground">جاهزون لدعم أسطولك من المعدات الثقيلة</h2>
            <p className="mt-2 text-accent-foreground/85">
              تواصل مع فريق {business.nameBrand} الآن لمراجعة حالة معدتك وتحديد الخدمة المناسبة.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 rounded-md bg-dark px-6 py-3 font-bold text-dark-foreground transition-colors hover:bg-dark-elevated"
          >
            تواصل معنا الآن
          </Link>
        </div>
      </section>
    </div>
  );
}
