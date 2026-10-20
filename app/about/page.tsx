import type { Metadata } from "next";
import { withSocial } from "@/lib/seo";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import CoverIllustration from "@/components/CoverIllustration";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { business, services } from "@/lib/content";
import { serviceIcons } from "@/components/Icons";

export const metadata: Metadata = withSocial({
  title: "من نحن",
  description:
    "تعرّف على شركة الأمير (ALAMIR TRAC)، ورشة صيانة وإعادة تأهيل المعدات الثقيلة وأنظمة الهيدروليك في البراجيل بالجيزة، بخبرة مؤسسها أحمد الأمير منذ عام 1997، ورسالتنا وقيمنا في العمل.",
  alternates: { canonical: "/about" },
});

const stats = [
  { value: "منذ 1997", label: "خبرة أحمد الأمير في المعدات الثقيلة" },
  { value: `${services.length}`, label: "خدمة صيانة متخصصة" },
  { value: "كل المحافظات", label: "صيانة في موقع العمل" },
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
    title: "استجابة ميدانية في كل المحافظات",
    description:
      "يصل فريقنا الفني إلى موقع العمل عند الحاجة، وتتوقف مدة الوصول على المسافة، لنقلّل وقت توقف المعدة قدر الإمكان.",
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
            أحمد الأمير: من عام 1997 في هيدروليك المعدات الثقيلة، واليوم في ورشته
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-dark-muted">
            ورشة «الأمير تراك» في البراجيل بالجيزة، يقودها مؤسسها أحمد الأمير بخبرة شخصية منذ عام 1997
            في هيدروليك ومحركات المعدات الثقيلة، وتخدم جميع المحافظات. نحدد سبب العطل أولاً، ونعرض على
            العميل الحل والتكلفة قبل أن نبدأ العمل.
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
            <SectionHeading eyebrow="قصتنا" title="بدأت بالهيدروليك، وتوسّعت إلى كل أنظمة المعدة الثقيلة" />
            <p className="mt-5 leading-8 text-muted">
              بدأ أحمد الأمير عمله عام 1997 في إصلاح مضخات وصمامات الهيدروليك، ومع السنين توسّع إلى
              محركات الديزل وأنظمة التبريد والكهرباء والمجنزرات وناقل الحركة.
            </p>
            <p className="mt-4 leading-8 text-muted">
              وفي عام 2026 أسّس «الأمير تراك» في البراجيل بالجيزة، ورشةً باسمه وتحت مسؤوليته، بفريق
              فني يعمل بإشرافه المباشر. والفكرة بسيطة: نحدد سبب العطل الحقيقي قبل أي إصلاح، ونكتب
              للعميل التكلفة قبل أن نبدأ العمل.
            </p>
            <p className="mt-4 leading-8 text-muted">
              رسالتنا أن نكون الورشة التي يتصل بها صاحب المعدة، في أي محافظة، أول ما تتوقف معدته:
              تشخيص صادق، وسعر واضح قبل العمل.
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
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-accent-text transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
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
