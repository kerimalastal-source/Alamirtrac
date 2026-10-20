import { after, NextResponse } from "next/server";
import { business } from "@/lib/content";
import { hasTelegramConfigured, sendTelegramMessage } from "@/lib/telegram";

const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
/** A form submitted faster than this was filled by a script, not a person. */
const MIN_FILL_MS = 2500;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Tells the owner on Telegram, after the response, so a request is never missed even if the email fails. */
function notifyOwner(fields: Record<string, string>, hasAttachment: boolean, emailSent: boolean) {
  if (!hasTelegramConfigured()) return;
  const ltr = (value: string) => `\u2066${escapeHtml(value)}\u2069`;
  const lines = [
    "📩 <b>طلب جديد من نموذج الموقع</b>",
    `👤 الاسم: ${escapeHtml(fields.name)}`,
    `📞 الهاتف: ${ltr(fields.phone)}`,
    fields.company ? `🏢 الشركة: ${escapeHtml(fields.company)}` : "",
    fields.email ? `✉️ البريد: ${ltr(fields.email)}` : "",
    fields.service ? `🛠️ الخدمة: ${escapeHtml(fields.service)}` : "",
    `📍 المصدر: ${escapeHtml(fields.source || "صفحة التواصل")}`,
    fields.message ? `📝 التفاصيل: ${escapeHtml(fields.message.slice(0, 600))}` : "",
    hasAttachment ? "📎 أرفق صورة (في البريد الإلكتروني)" : "",
    emailSent ? "✅ وصل البريد الإلكتروني" : "⚠️ تعذّر إرسال البريد الإلكتروني، اتصل بالعميل مباشرة",
  ].filter(Boolean);
  after(() => sendTelegramMessage(lines.join("\n")).then(() => undefined).catch((error) => console.error("[contact] telegram failed", error instanceof Error ? error.message : error)));
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "خدمة إرسال البريد غير مفعّلة بعد على الموقع. تواصل مع مدير الموقع." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();
  const attachment = formData.get("attachment");

  // Spam: a filled honeypot or an instant submission gets a fake success, so a bot learns nothing.
  const startedAt = Number(formData.get("startedAt"));
  if (String(formData.get("website") ?? "").trim() || (startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS)) {
    return NextResponse.json({ ok: true });
  }
  if (formData.get("consent") !== "yes") {
    return NextResponse.json({ ok: false, error: "يرجى الموافقة على استخدام بياناتك للتواصل معك." }, { status: 400 });
  }

  if (!name || !phone) {
    return NextResponse.json({ ok: false, error: "الاسم ورقم الهاتف مطلوبان." }, { status: 400 });
  }

  const attachments: { filename: string; content: string }[] = [];
  if (attachment instanceof File && attachment.size > 0) {
    if (attachment.size > MAX_ATTACHMENT_BYTES) {
      return NextResponse.json(
        { ok: false, error: "حجم الصورة المرفقة أكبر من 4 ميجابايت." },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(await attachment.arrayBuffer());
    attachments.push({ filename: attachment.name || "attachment", content: buffer.toString("base64") });
  }

  const rows: [string, string][] = [
    ["الاسم", name],
    ["اسم الشركة / المؤسسة", company || "—"],
    ["رقم الهاتف", phone],
    ["البريد الإلكتروني", email || "—"],
    ["نوع الخدمة", service || "—"],
    ["مصدر الطلب", source || "نموذج التواصل في الموقع"],
  ];

  const html = `
    <div style="font-family: Tahoma, Arial, sans-serif; text-align: right; direction: rtl;">
      <h2>طلب تواصل جديد من موقع ${escapeHtml(business.nameBrand)}</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 480px;">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding: 6px 10px; font-weight: bold; border: 1px solid #e2e8f0;">${escapeHtml(label)}</td>
            <td style="padding: 6px 10px; border: 1px solid #e2e8f0;">${escapeHtml(value)}</td>
          </tr>`,
          )
          .join("")}
      </table>
      ${message ? `<p style="margin-top: 16px;"><strong>تفاصيل الطلب:</strong><br />${escapeHtml(message).replace(/\n/g, "<br />")}</p>` : ""}
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${business.nameBrand} <onboarding@resend.dev>`,
      to: [business.email],
      reply_to: email || undefined,
      subject: `طلب تواصل جديد من ${name}`,
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Resend API error:", errorBody);
    notifyOwner({ name, phone, company, email, service, message, source }, attachments.length > 0, false);
    return NextResponse.json({ ok: false, error: "تعذّر إرسال الطلب حالياً، حاول مرة أخرى لاحقاً." }, { status: 502 });
  }

  notifyOwner({ name, phone, company, email, service, message, source }, attachments.length > 0, true);
  return NextResponse.json({ ok: true });
}
