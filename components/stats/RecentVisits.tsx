"use client";

import { useMemo, useState } from "react";
import Flag from "@/components/stats/Flag";

export type VisitView = {
  id: string;
  time: string;
  live: boolean;
  country: string | null;
  place: string;
  device: string;
  source: string;
  campaign: string | null;
  verdict: "real" | "unsure" | "bot" | "pending";
  verdictLabel: string;
  reasons: string[];
  pages: { name: string; seconds: string | null }[];
  clicks: { label: string; page: string | null; form: boolean }[];
};

const FILTERS = [
  { key: "all", label: "الكل" },
  { key: "real", label: "🟢 حقيقيون" },
  { key: "clicked", label: "👆 نقروا على تواصل" },
  { key: "form", label: "📝 أرسلوا نموذجاً" },
  { key: "bot", label: "🔴 آليون" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const matches = (v: VisitView, key: FilterKey) =>
  key === "all" ||
  (key === "real" && v.verdict === "real") ||
  (key === "bot" && v.verdict === "bot") ||
  (key === "clicked" && v.clicks.some((c) => !c.form)) ||
  (key === "form" && v.clicks.some((c) => c.form));

const PAGE = 15;

/** The latest visits one by one, with filters and a full timeline for each. */
export default function RecentVisits({ visits }: { visits: VisitView[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [country, setCountry] = useState("");
  const [shown, setShown] = useState(PAGE);

  const countries = useMemo(() => {
    const map = new Map<string, { code: string; name: string; n: number }>();
    for (const v of visits) {
      if (!v.country) continue;
      const entry = map.get(v.country) ?? { code: v.country, name: v.place.split("،").at(-1)?.trim() ?? v.country, n: 0 };
      entry.n += 1;
      map.set(v.country, entry);
    }
    return [...map.values()].sort((a, b) => b.n - a.n);
  }, [visits]);

  const list = visits.filter((v) => matches(v, filter) && (!country || v.country === country));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const n = visits.filter((v) => matches(v, f.key)).length;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setFilter(f.key);
                setShown(PAGE);
              }}
              aria-pressed={filter === f.key}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-bold text-muted transition-colors hover:text-foreground aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              {f.label} <span className="font-normal opacity-80">{n}</span>
            </button>
          );
        })}
        {countries.length > 1 && (
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setShown(PAGE);
            }}
            aria-label="تصفية حسب الدولة"
            className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-bold text-muted"
          >
            <option value="">كل الدول</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.n})
              </option>
            ))}
          </select>
        )}
      </div>

      {list.length === 0 ? (
        <p className="mt-6 text-sm text-muted">لا توجد زيارات تطابق هذا الاختيار.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {list.slice(0, shown).map((v) => (
            <li key={v.id} className="py-3">
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 marker:content-none">
                  <Flag code={v.country} />
                  <span className="font-bold text-foreground">{v.place}</span>
                  {v.live && (
                    <span className="flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-bold text-green-700 dark:text-green-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" /> الآن
                    </span>
                  )}
                  <span className="text-sm text-muted">{v.time}</span>
                  <span className="text-sm text-muted">· {v.device}</span>
                  <span className="text-sm text-muted">· {v.pages.length} {v.pages.length === 1 ? "صفحة" : "صفحات"}</span>
                  {v.clicks.map((c, i) => (
                    <span key={i} className={`rounded-full px-2 py-0.5 text-xs font-bold ${c.form ? "bg-green-500/15 text-green-700 dark:text-green-400" : "bg-accent/15 text-accent-strong"}`}>
                      {c.form ? "📝" : "👆"} {c.label}
                    </span>
                  ))}
                  <span className="ms-auto rounded-full bg-surface-2 px-3 py-0.5 text-xs font-bold text-foreground">{v.verdictLabel}</span>
                  <span className="text-xs text-muted group-open:hidden">التفاصيل ▾</span>
                  <span className="hidden text-xs text-muted group-open:inline">إخفاء ▴</span>
                </summary>

                <div className="mt-3 grid gap-4 rounded-xl bg-background p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="font-bold text-foreground">رحلة الزائر</p>
                    <ol className="mt-2 space-y-1">
                      {v.pages.map((p, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-muted">{i + 1}.</span>
                          <span className="text-foreground">{p.name}</span>
                          {p.seconds && <span className="text-muted">· {p.seconds}</span>}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <span className="font-bold text-foreground">المصدر: </span>
                      <span className="text-muted">{v.source}</span>
                      {v.campaign && (
                        <span className="text-muted">
                          {" "}
                          · الحملة: <bdi>{v.campaign}</bdi>
                        </span>
                      )}
                    </p>
                    {v.clicks.length > 0 && (
                      <p>
                        <span className="font-bold text-foreground">ماذا ضغط: </span>
                        <span className="text-muted">{v.clicks.map((c) => (c.page ? `${c.label} (من صفحة ${c.page})` : c.label)).join("، ")}</span>
                      </p>
                    )}
                    <p>
                      <span className="font-bold text-foreground">لماذا هذا التقييم: </span>
                      <span className="text-muted">{v.reasons.length ? v.reasons.join("، ") : "لا توجد إشارات كافية بعد"}</span>
                    </p>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      {list.length > shown && (
        <button type="button" onClick={() => setShown((n) => n + PAGE)} className="mt-4 w-full rounded-xl border border-border bg-background py-2.5 text-sm font-bold text-muted hover:text-foreground">
          عرض المزيد ({list.length - shown})
        </button>
      )}
    </div>
  );
}
