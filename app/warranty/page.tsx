import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionHeading from "@/components/SectionHeading";
import { business } from "@/lib/content";
import { flags } from "@/lib/flags";
import { legalUpdatedLine } from "@/lib/legal";
import { withSocial } from "@/lib/seo";

export const metadata: Metadata = withSocial({
  title: "الضمان",
  description: `ما يغطيه ضمان ${business.fullName} على أعمال الصيانة وقطع الغيار، وما يُسقطه، وكيف تطلب الاستفادة منه.`,
  alternates: { canonical: "/warranty" },
});

const h2 = "mt-10 text-xl font-bold text-foreground";
const p = "mt-3 leading-8 text-muted";

export default function WarrantyPage() {
  if (!flags.warranty) notFound();
  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <SectionHeading as="h1" eyebrow="الضمان" title="شروط الضمان" description={legalUpdatedLine ?? undefined} />
      {/* DRAFT: the terms below await the lawyer's review; the page stays hidden until NEXT_PUBLIC_WARRANTY_LIVE=1. */}
      <h2 className={h2}>ما يغطيه الضمان</h2>
      <p className={p}>يُذكر الضمان مكتوباً على فاتورة كل عملية، ويحدد ما إذا كان على المصنعية أو القطع أو كليهما، ومدته بالأشهر أو بساعات التشغيل.</p>
      <h2 className={h2}>ما يُسقط الضمان</h2>
      <p className={p}>الاستخدام خارج الحمولة أو الظروف المقررة، وتدخّل جهة أخرى في العمل المضمون، وإهمال الصيانة الدورية.</p>
      <h2 className={h2}>كيف تطلب الاستفادة منه</h2>
      <p className={p}>
        تواصل معنا واذكر رقم الفاتورة على <span dir="ltr">{business.phoneLocal}</span> أو {business.email}، وسنعاين المعدة ونبلغك بالقرار.
      </p>
    </div>
  );
}
