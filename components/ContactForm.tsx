"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { trackAction } from "@/lib/track-action";
import { business, services } from "@/lib/content";
import ConsentField from "@/components/ConsentField";
import FormGuard from "@/components/FormGuard";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const presetService = useSearchParams().get("service") ?? "";
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fileName, setFileName] = useState("");

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
      trackAction("form", String(new FormData(form).get("service") ?? ""));
      form.reset();
      setFileName("");
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
        <select
          id="service"
          name="service"
          defaultValue={presetService}
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent"
        >
          <option value="">اختر الخدمة</option>
          {services.map((item) => (
            <option key={item.slug} value={item.title}>
              {item.title}
            </option>
          ))}
          <option value="غير متأكد">غير متأكد</option>
        </select>
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
        <div className="flex w-full items-center gap-3 rounded-md border border-border bg-background px-3.5 py-2.5">
          <label
            htmlFor="attachment"
            className="shrink-0 cursor-pointer rounded-md bg-accent px-3 py-1.5 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-strong"
          >
            اختيار ملف
          </label>
          <span className="truncate text-sm text-muted">{fileName || "لم يتم اختيار أي ملف"}</span>
        </div>
        <input
          id="attachment"
          name="attachment"
          type="file"
          accept="image/*"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
          className="sr-only"
        />
        <p className="mt-1 text-xs text-muted">أقصى حجم للصورة 4 ميجابايت.</p>
      </div>

      <ConsentField id="contact-consent" />
      <FormGuard />

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-md bg-accent px-6 py-3 font-bold text-accent-foreground transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? "جارٍ الإرسال..." : "إرسال الطلب"}
      </button>

      {status === "sent" && (
        <p role="status" className="text-sm font-bold leading-7 text-accent">
          وصلنا طلبك. سنتواصل معك على رقمك في أقرب وقت خلال مواعيد العمل. وإذا كان العطل مستعجلاً فاتصل بنا على{" "}
          <a href={`tel:${business.phone}`} dir="ltr" className="underline">
            {business.phoneLocal}
          </a>
          .
        </p>
      )}
      {status === "error" && <p className="text-sm font-bold text-red-600">{errorMessage}</p>}
    </form>
  );
}
