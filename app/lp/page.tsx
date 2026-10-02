import type { Metadata } from "next";
import LandingLeadForm from "@/components/LandingLeadForm";
import { WhatsappIcon, PhoneCallIcon, serviceIcons } from "@/components/Icons";
import { business, services, faqCategories } from "@/lib/content";

export const metadata: Metadata = {
  title: "اطلب صيانة معداتك الثقيلة الآن",
  description:
    "فريق فني متخصص بخبرة تتجاوز 30 عاماً لصيانة وإعادة تأهيل المعدات الثقيلة وأنظمة الهيدروليك في جميع محافظات مصر. اتصل أو تواصل عبر واتساب الآن.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/lp" },
};

const stats = [
  { value: "+30", label: "عاماً من الخبرة" },
  { value: "كل مصر", label: "تغطية جميع المحافظات" },
  { value: "15", label: "خدمة صيانة متخصصة" },
];

const whyUs = [
  {
    title: "تشخيص دقيق قبل الإصلاح",
    description: "نحدد السبب الحقيقي للعطل أولاً، بدلاً من التسرع في استبدال قطع سليمة لا تحتاج إلى تغيير.",
  },
  {
    title: "تغطية شاملة لكل الأنظمة",
    description: "من المحرك والهيدروليك إلى التبريد والديزل والكهرباء والمجنزر، في فريق فني واحد.",
  },
  {
    title: "استجابة سريعة",
    description: "فريقنا جاهز لمعالجة حالتك بسرعة لتقليل وقت توقف المعدة إلى أقل حد ممكن.",
  },
  {
    title: "شفافية كاملة في التكلفة",
    description: "نوضح حالة المعدة والخيارات المتاحة بصراحة قبل البدء في أي عمل.",
  },
];

const quickServiceSlugs = [
  "heavy-equipment-maintenance",
  "hydraulic-systems",
  "engine-maintenance",
  "rehabilitation",
  "emergency-field-service",
  "maintenance-contracts",
];
const quickServices = quickServiceSlugs
  .map((slug) => services.find((service) => service.slug === slug))
  .filter((service): service is NonNullable<typeof service> => Boolean(service));

const steps = [
  {
    title: "تواصل معنا",
    description: "اتصل، راسلنا عبر واتساب، أو اترك بياناتك في النموذج ليتواصل معك فريقنا.",
  },
  {
    title: "فحص وتشخيص دقيق",
    description: "نراجع حالة المعدة ونوضح لك الأعطال والخيارات المتاحة بشفافية كاملة.",
  },
  {
    title: "إصلاح واستلام المعدة",
    description: "ننفذ العمل المتفق عليه، ونتابع أداء المعدة بعد التسليم للتأكد من استقرار الإصلاح.",
  },
];

const faqSlugs = [
  "ما هي المناطق التي تغطيها خدماتكم؟",
  "كيف تُحدَّد تكلفة الصيانة أو الإصلاح؟",
  "هل التواصل عبر واتساب متاح؟",
];
const quickFaq = faqCategories
  .flatMap((category) => category.items)
  .filter((item) => faqSlugs.includes(item.question));

export default function LandingPage() {
  return (
    <div>
      <section className="bg-grid bg-dark">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-sm font-bold tracking-wide text-accent">
              {business.nameBrand} — الأمير تراك
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-dark-foreground sm:text-4xl lg:text-5xl">
              معدتك الثقيلة متوقفة عن العمل؟ فريقنا الفني يصلك بخبرة تتجاوز 30 عاماً
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-dark-muted">
              صيانة وإصلاح وإعادة تأهيل المعدات الثقيلة وأنظمة الهيدروليك في جميع محافظات مصر — تشخيص
              دقيق، وشفافية كاملة في التكلفة، واستجابة سريعة لتقليل وقت التوقف.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-2 rounded-md bg-accent px-6 py-3 font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
              >
                <PhoneCallIcon className="h-5 w-5" />
                اتصل بنا الآن
              </a>
              <a
                href={business.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-[#25D366] px-6 py-3 font-bold text-white transition-colors hover:bg-[#1eb955]"
              >
                <WhatsappIcon className="h-5 w-5" />
                تواصل عبر واتساب
              </a>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 border-t border-dark-border pt-10 ps-16 sm:ps-0">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-heading text-2xl font-extrabold text-accent sm:text-3xl">{stat.value}</div>
                  <div className="mt-1 text-sm text-dark-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:justify-self-end lg:self-start">
            <LandingLeadForm />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold tracking-wide text-accent">لماذا {business.nameBrand}</span>
          <h2 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
            خبرة ميدانية تحمي معداتك من التوقف
          </h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {whyUs.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold tracking-wide text-accent">خدماتنا</span>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">أبرز خدمات الصيانة لدينا</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickServices.map((service) => {
              const Icon = serviceIcons[service.icon];
              return (
                <div key={service.slug} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{service.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted">{service.short}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold tracking-wide text-accent">خطوات بسيطة</span>
          <h2 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">كيف نعمل معك</h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-accent-foreground">
                {index + 1}
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {quickFaq.length > 0 && (
        <section className="border-y border-border bg-background">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-bold tracking-wide text-accent">أسئلة شائعة</span>
              <h2 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">قبل ما تتواصل معنا</h2>
            </div>
            <div className="mt-10 space-y-4">
              {quickFaq.map((item) => (
                <div key={item.question} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                  <h3 className="font-bold text-foreground">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">جاهزون لإصلاح معدتك الآن</h2>
            <p className="mt-4 leading-8 text-muted">
              لا تترك العطل يتفاقم. تواصل معنا الآن عبر الاتصال أو واتساب، أو اترك بياناتك وسنتصل بك خلال
              وقت قصير لمراجعة حالة معدتك وتحديد الخدمة المناسبة.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-2 rounded-md bg-accent px-6 py-3 font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
              >
                <PhoneCallIcon className="h-5 w-5" />
                اتصل بنا الآن
              </a>
              <a
                href={business.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-[#25D366] px-6 py-3 font-bold text-white transition-colors hover:bg-[#1eb955]"
              >
                <WhatsappIcon className="h-5 w-5" />
                تواصل عبر واتساب
              </a>
            </div>
          </div>
          <LandingLeadForm title="أو اترك بياناتك وسنتصل بك" />
        </div>
      </section>
    </div>
  );
}
