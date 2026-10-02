"use client";

import { useId, useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const quickServices = [
  "صيانة المعدات الثقيلة",
  "صيانة أنظمة الهيدروليك",
  "صيانة المحركات",
  "إعادة تأهيل شاملة",
  "صيانة طارئة في الموقع",
  "خدمة أخرى",
];

export default function LandingLeadForm({ title = "اطلب أن نتصل بك" }: { title?: string }) {
  const uid = useId();
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

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/10 p-6 text-center sm:p-8">
        <p className="font-bold text-foreground">تم إرسال طلبك بنجاح.</p>
        <p className="mt-1 text-sm text-muted">سيتواصل معك فريقنا الفني خلال وقت قصير.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <input type="hidden" name="source" value="صفحة الهبوط - إعلان ممول" />
      <h3 className="text-lg font-bold text-foreground">{title}</h3>

      <div>
        <label htmlFor={`${uid}-name`} className="mb-1.5 block text-sm font-bold text-foreground">
          الاسم <span className="text-accent">*</span>
        </label>
        <input
          id={`${uid}-name`}
          name="name"
          required
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          placeholder="اسمك الكامل"
        />
      </div>

      <div>
        <label htmlFor={`${uid}-phone`} className="mb-1.5 block text-sm font-bold text-foreground">
          رقم الهاتف <span className="text-accent">*</span>
        </label>
        <input
          id={`${uid}-phone`}
          name="phone"
          required
          dir="ltr"
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground text-right outline-none focus:border-accent"
          placeholder="01xxxxxxxxx"
        />
      </div>

      <div>
        <label htmlFor={`${uid}-service`} className="mb-1.5 block text-sm font-bold text-foreground">
          نوع الخدمة
        </label>
        <select
          id={`${uid}-service`}
          name="service"
          defaultValue=""
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
        >
          <option value="" disabled>
            اختر نوع الخدمة
          </option>
          {quickServices.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-md bg-accent px-6 py-3 font-bold text-accent-foreground transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "جارٍ الإرسال..." : "اطلب اتصال الآن"}
      </button>

      {status === "error" && <p className="text-sm font-bold text-red-600">{errorMessage}</p>}
    </form>
  );
}
