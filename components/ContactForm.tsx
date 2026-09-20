"use client";

import { useState, type FormEvent } from "react";
import { business } from "@/lib/content";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const phone = String(data.get("phone") ?? "");
    const service = String(data.get("service") ?? "");
    const message = String(data.get("message") ?? "");

    const subject = `طلب صيانة من ${name || "زائر الموقع"}`;
    const body = [`الاسم: ${name}`, `رقم التواصل: ${phone}`, `نوع الخدمة: ${service}`, "", message].join("\n");

    window.location.href = `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-bold text-foreground">
            الاسم
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
            placeholder="اسمك الكامل"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-bold text-foreground">
            رقم التواصل
          </label>
          <input
            id="phone"
            name="phone"
            required
            dir="ltr"
            className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
            placeholder="01xxxxxxxxx"
          />
        </div>
      </div>

      <div>
        <label htmlFor="service" className="mb-1.5 block text-sm font-bold text-foreground">
          نوع الخدمة المطلوبة
        </label>
        <input
          id="service"
          name="service"
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          placeholder="مثال: صيانة هيدروليك، إعادة تأهيل محرك..."
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-bold text-foreground">
          تفاصيل العطل
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          placeholder="اشرح لنا العطل أو الخدمة المطلوبة بالتفصيل..."
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-accent px-6 py-3 font-bold text-accent-foreground transition-colors hover:bg-accent-strong sm:w-auto"
      >
        إرسال الطلب
      </button>

      {sent && (
        <p className="text-sm text-accent">
          سيتم فتح تطبيق البريد لإرسال طلبك إلى فريقنا. إذا لم يفتح تلقائياً، راسلنا مباشرة على {business.email}.
        </p>
      )}
    </form>
  );
}
