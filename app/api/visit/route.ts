import { NextResponse } from "next/server";
import { business } from "@/lib/content";

const BOT_PATTERN = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|monitor|curl|wget/i;

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function decode(value: string | null) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function deviceType(userAgent: string) {
  if (/ipad|tablet/i.test(userAgent)) return "جهاز لوحي";
  if (/mobi|android|iphone/i.test(userAgent)) return "هاتف";
  return "حاسوب";
}

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || BOT_PATTERN.test(userAgent)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const body = await request.json().catch(() => ({}));
  const path = String(body?.path ?? "/").slice(0, 200);
  const referrer = String(body?.referrer ?? "").slice(0, 300);

  const country = decode(request.headers.get("x-vercel-ip-country"));
  const city = decode(request.headers.get("x-vercel-ip-city"));
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const location = [city, country].filter(Boolean).join("، ") || "غير معروف";

  const lines = [
    `👀 <b>زائر جديد على ${escapeHtml(business.nameBrand)}</b>`,
    `📄 الصفحة: ${escapeHtml(path)}`,
    `🔗 جاء من: ${escapeHtml(referrer || "دخول مباشر")}`,
    `📍 الموقع: ${escapeHtml(location)}`,
    `📱 الجهاز: ${deviceType(userAgent)}`,
    ip ? `🌐 IP: ${escapeHtml(ip)}` : "",
  ].filter(Boolean);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join("\n"),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    console.error("Telegram API error:", await response.text());
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
