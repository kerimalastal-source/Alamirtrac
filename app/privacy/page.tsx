import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionHeading from "@/components/SectionHeading";
import { business } from "@/lib/content";
import { flags } from "@/lib/flags";
import { legalIdentity, legalUpdatedLine } from "@/lib/legal";
import { withSocial } from "@/lib/seo";

export const metadata: Metadata = withSocial({
  title: "سياسة الخصوصية",
  description: `كيف تجمع ${business.fullName} بياناتك وتستخدمها وتحميها، وما الكوكيز التي نستخدمها وكيف تتحكم بها.`,
  alternates: { canonical: "/privacy" },
});

const h2 = "mt-10 text-xl font-bold text-foreground";
const p = "mt-3 leading-8 text-muted";

export default function PrivacyPage() {
  if (!flags.privacy) notFound();
  const { name, ids } = legalIdentity();

  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <SectionHeading as="h1" eyebrow="الخصوصية" title="سياسة الخصوصية" description={legalUpdatedLine ?? undefined} />

      <h2 className={h2}>من نحن</h2>
      <p className={p}>
        {name}، ورشتنا في {business.address}. للتواصل بشأن بياناتك: {business.email}.
        {ids && ` السجل التجاري: ${ids.register}، الرقم الضريبي: ${ids.tax}.`}
      </p>

      <h2 className={h2}>البيانات التي نجمعها</h2>
      <p className={p}>
        عند إرسال طلب عبر نموذج الموقع نحفظ الاسم ورقم الهاتف والخدمة المطلوبة ووصف العطل وأي ملف ترفقه، لنتواصل معك بخصوص طلبك فقط. لا نبيع بياناتك ولا نشاركها مع أي جهة لأغراض تسويقية.
      </p>

      <h2 className={h2}>إحصاءات الزيارات</h2>
      <p className={p}>
        يسجّل الموقع زياراتك دون اسمك أو رقمك: الصفحات التي تفتحها، والدولة والمدينة التقريبيتان، ونوع الجهاز والمتصفح، ومصدر وصولك، ومدة بقائك. نستخدم ذلك لفهم أداء الموقع وتحسينه، ونحذف هذه السجلات بعد اثني عشر شهراً.
      </p>

      <h2 className={h2}>الكوكيز وأدوات القياس</h2>
      <p className={p}>
        لا نشغّل أدوات Meta Pixel وGoogle Analytics إلا بعد موافقتك على البنر. تساعدنا هذه الأدوات على قياس الزيارات والطلبات وتقييم إعلاناتنا. إن رفضت فلن يُحمَّل أي منهما. يمكنك تغيير اختيارك في أي وقت من رابط «إعدادات الكوكيز» أسفل كل صفحة.
      </p>

      <h2 className={h2}>مدة الاحتفاظ بالبيانات</h2>
      <p className={p}>نحتفظ ببيانات الطلبات للمدة اللازمة لخدمتك ومتابعة أعمال الصيانة، ثم نحذفها أو نجعلها مجهولة الهوية.</p>

      <h2 className={h2}>حقوقك</h2>
      <p className={p}>
        يحق لك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها، بمراسلتنا على {business.email} أو بالاتصال على{" "}
        <span dir="ltr">{business.phoneLocal}</span>.
      </p>
    </div>
  );
}
