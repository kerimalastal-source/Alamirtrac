"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: new FormData(form),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        setStatus("error");
        setErrorMessage(result.error || "تعذّر إرسال الطلب، حاول مرة أخرى.");
        return;
      }

      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("تعذّر الاتصال بالخادم، تحقق من الإنترنت وحاول مرة أخرى.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-bold text-foreground">
            الاسم <span className="text-accent">*</span>
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
            رقم الهاتف <span className="text-accent">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            required
            dir="ltr"
            className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground text-right outline-none focus:border-accent"
            placeholder="01xxxxxxxxx"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className="mb-1.5 block text-sm font-bold text-foreground">
            اسم الشركة / المؤسسة
          </label>
          <input
            id="company"
            name="company"
            className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
            placeholder="اختياري"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-foreground">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            name="email"
            type="email"
            dir="ltr"
            className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground text-right outline-none focus:border-accent"
            placeholder="اختياري"
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
          تفاصيل الطلب
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          placeholder="اشرح لنا العطل أو الخدمة المطلوبة بالتفصيل..."
        />
      </div>

      <div>
        <label htmlFor="attachment" className="mb-1.5 block text-sm font-bold text-foreground">
          إرفاق صورة (اختياري)
        </label>
        <input
          id="attachment"
          name="attachment"
          type="file"
          accept="image/*"
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-muted outline-none file:me-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-accent-foreground"
        />
        <p className="mt-1 text-xs text-muted">أقصى حجم للصورة 4 ميجابايت.</p>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-md bg-accent px-6 py-3 font-bold text-accent-foreground transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "جارٍ الإرسال..." : "إرسال الطلب"}
      </button>

      {status === "sent" && (
        <p className="text-sm font-bold text-accent">تم إرسال طلبك بنجاح، سيتواصل معك فريقنا قريباً.</p>
      )}
      {status === "error" && <p className="text-sm font-bold text-red-600">{errorMessage}</p>}
    </form>
  );
}
