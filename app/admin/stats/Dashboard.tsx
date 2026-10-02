import { cityAr, countryAr, placeAr } from "@/lib/arabic-places";
import { sourceLabel } from "@/lib/attribution";
import { CONTINENT_LABEL, groupByPlace } from "@/lib/geo-regions";
import { pageName } from "@/lib/page-names";
import { ONLINE_MINUTES, type SiteStats } from "@/lib/site-stats";
import { agoLabel, buildInsights, change, durationLabel, hourLabel, WEEKDAY_AR } from "@/lib/stats-insights";
import { browserLabel, osLabel, VERDICT_LABEL } from "@/lib/visit-insights";
import { pageTime } from "@/lib/visits";
import Flag from "@/components/stats/Flag";
import RecentVisits, { type VisitView } from "@/components/stats/RecentVisits";

const KIND_LABEL: Record<string, string> = {
  whatsapp: "واتساب",
  phone: "اتصال هاتفي",
  email: "بريد إلكتروني",
  facebook: "فيسبوك",
  instagram: "إنستغرام",
  form: "إرسال نموذج التواصل",
};
const DEVICE_LABEL: Record<string, string> = { mobile: "جوال", tablet: "جهاز لوحي", desktop: "حاسوب", "": "غير معروف" };

const fmt = new Intl.NumberFormat("en-US");
const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("ar-EG-u-nu-latn", { timeZone: "Africa/Cairo", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

const sourceName = (s: { source: string | null; medium: string | null }) =>
  !s.source || !s.medium || s.medium === "unknown" ? "غير مسجّل" : sourceLabel({ source: s.source, medium: s.medium as never });

const card = "rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6";
const th = "px-3 py-2 text-start text-xs font-bold text-muted";
const td = "px-3 py-2 align-middle";

function Section({ title, hint, children, id }: { title: string; hint?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className={card}>
      <h2 className="text-lg font-extrabold text-foreground">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const Empty = ({ text = "لا توجد بيانات في هذه الفترة بعد." }: { text?: string }) => <p className="text-sm text-muted">{text}</p>;

/** A horizontal bar whose width is `value` out of `max`. */
function Bar({ value, max, className = "bg-accent" }: { value: number; max: number; className?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${max > 0 ? Math.max(2, (value / max) * 100) : 0}%` }} />
    </div>
  );
}

function Delta({ now, before }: { now: number; before: number }) {
  const c = change(now, before);
  if (!c || c.direction === "same") return null;
  const up = c.direction === "up";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${up ? "bg-green-500/15 text-green-700 dark:text-green-400" : "bg-red-500/15 text-red-600"}`} title="مقارنة بالفترة السابقة">
      {up ? "▲" : "▼"} {c.percent}%
    </span>
  );
}

function Kpi({ label, value, note, delta }: { label: string; value: string; note: string; delta?: React.ReactNode }) {
  return (
    <div className={card}>
      <p className="flex items-center justify-between gap-2 text-sm font-bold text-muted">
        {label}
        {delta}
      </p>
      <p className="mt-1 text-3xl font-extrabold text-foreground" dir="ltr">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted">{note}</p>
    </div>
  );
}

function VisitsChart({ stats }: { stats: SiteStats }) {
  const dayLabel = (d: string) =>
    new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`));
  type B = { label: string; visits: number };
  let bars: B[];
  if (stats.days <= 30) {
    bars = stats.daily.map((d) => ({ label: dayLabel(d.day), visits: d.visits }));
  } else {
    const size = stats.days === 90 ? 7 : 0;
    const groups = new Map<string, B>();
    stats.daily.forEach((d, i) => {
      const key = size ? String(Math.floor(i / size)) : d.day.slice(0, 7);
      const label = size
        ? `أسبوع ${dayLabel(stats.daily[Math.floor(i / size) * size].day)}`
        : new Intl.DateTimeFormat("ar-EG-u-nu-latn", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${d.day.slice(0, 7)}-01T00:00:00Z`));
      const bar = groups.get(key) ?? { label, visits: 0 };
      bar.visits += d.visits;
      groups.set(key, bar);
    });
    bars = [...groups.values()];
  }
  const max = Math.max(1, ...bars.map((b) => b.visits));
  const width = 720;
  const height = 170;
  const gap = 2;
  const barWidth = bars.length ? (width - gap * (bars.length - 1)) / bars.length : 0;
  return (
    <svg viewBox={`0 0 ${width} ${height + 22}`} role="img" aria-label={`عدد الزيارات، الحد الأعلى ${max}`} className="w-full" direction="ltr">
      <line x1="0" x2={width} y1={height} y2={height} stroke="var(--border)" />
      {bars.map((b, i) => {
        const h = (b.visits / max) * (height - 14);
        return (
          <g key={i}>
            <title>{`${b.label}: ${b.visits} زيارة`}</title>
            <rect x={i * (barWidth + gap)} y="0" width={barWidth + gap} height={height} fill="transparent" />
            <rect x={i * (barWidth + gap)} y={height - h} width={barWidth} height={Math.max(h, b.visits ? 1 : 0)} rx="2" fill="var(--accent)" />
          </g>
        );
      })}
      <text x="0" y={height + 16} fontSize="11" fill="var(--muted)">{bars[0]?.label}</text>
      <text x={width} y={height + 16} fontSize="11" textAnchor="end" fill="var(--muted)">{bars.at(-1)?.label}</text>
      <text x="0" y="10" fontSize="11" fill="var(--muted)">{max}</text>
    </svg>
  );
}

/** Columns for a small distribution (hours of the day, days of the week); the busiest one is highlighted. */
function Columns({ values, labels, caption }: { values: number[]; labels: string[]; caption: string }) {
  const max = Math.max(1, ...values);
  const peak = values.indexOf(Math.max(...values));
  return (
    <div role="img" aria-label={caption} className="flex h-40 items-end gap-1" dir="ltr">
      {values.map((v, i) => (
        <div key={i} className="group relative flex h-full flex-1 flex-col justify-end" title={`${labels[i]}: ${v} زيارة`}>
          <div className={`w-full rounded-t ${i === peak && v > 0 ? "bg-accent" : "bg-accent/40"}`} style={{ height: `${(v / max) * 100}%`, minHeight: v ? 2 : 0 }} />
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ stats }: { stats: SiteStats }) {
  const insights = buildInsights(stats);
  const now = new Date(stats.now).getTime();
  const totalVisits = stats.visits;
  const places = groupByPlace(stats.countries);
  const countries = [...stats.countries].filter((c) => c.visits > 0);
  const maxCountry = Math.max(1, ...countries.map((c) => c.visits));
  const maxCity = Math.max(1, ...stats.cities.map((c) => c.visits));
  const liveVisits = stats.recent.filter((r) => now - new Date(r.lastAt).getTime() <= ONLINE_MINUTES * 60_000);

  const views: VisitView[] = stats.recent.map((r, i) => ({
    id: String(i),
    time: agoLabel(r.startedAt, now) ?? dateTime(r.startedAt),
    live: now - new Date(r.lastAt).getTime() <= ONLINE_MINUTES * 60_000,
    country: r.country,
    place: placeAr(r.city, r.country),
    device: [DEVICE_LABEL[r.device ?? ""] ?? r.device, osLabel(r.os), browserLabel(r.browser)].filter(Boolean).join(" · "),
    source: r.source ? sourceName(r) : r.referrer ? r.referrer.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] : "دخول مباشر",
    campaign: r.campaign,
    verdict: r.verdict,
    verdictLabel: VERDICT_LABEL[r.verdict],
    reasons: r.reasons,
    pages: r.pages.map((p) => ({ name: pageName(p.path), seconds: p.seconds != null ? pageTime(p.seconds) : null })),
    clicks: r.clicks.map((c) => ({ label: KIND_LABEL[c.kind] ?? c.kind, page: c.path ? pageName(c.path) : null, form: c.kind === "form" })),
  }));

  const f = stats.funnel;
  const steps = [
    { label: "زاروا الموقع", n: f.visitors, hint: "كل الزوار المسجّلين في هذه الفترة" },
    { label: "تصفّحوا بتمعّن", n: f.engaged, hint: "فتحوا أكثر من صفحة أو بقوا 15 ثانية فأكثر" },
    { label: "وصلوا إلى صفحة التواصل أو الطلب", n: f.intent, hint: "فتحوا «اتصل بنا» أو صفحة طلب عرض السعر" },
    { label: "نقروا على وسيلة تواصل", n: f.clicked, hint: "واتساب أو اتصال أو بريد أو منصات التواصل" },
    { label: "أرسلوا نموذجاً", n: f.submitted, hint: "طلب وصلك فعلاً" },
  ];
  const clickTotal = stats.clicks.reduce((n, c) => n + c.clicks, 0);
  const maxClick = Math.max(1, ...stats.clicks.map((c) => c.clicks));
  const deviceMax = Math.max(1, ...stats.devices.map((d) => d.visits));
  const browserMax = Math.max(1, ...stats.browsers.map((b) => b.visits));

  return (
    <div className="space-y-6">
      {/* الآن على الموقع */}
      <section className={`${card} border-green-500/30`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className={`absolute inline-flex h-full w-full rounded-full ${stats.onlineNow ? "animate-ping bg-green-500/60" : ""}`} />
            <span className={`relative inline-flex h-3 w-3 rounded-full ${stats.onlineNow ? "bg-green-500" : "bg-slate-400"}`} />
          </span>
          <h2 className="text-lg font-extrabold text-foreground">
            {stats.onlineNow === 0 ? "لا يوجد زوار على الموقع الآن" : stats.onlineNow === 1 ? "زائر واحد على الموقع الآن" : `${stats.onlineNow} زوار على الموقع الآن`}
          </h2>
          <span className="text-sm text-muted">(من فتح صفحة أو تنقّل خلال آخر {ONLINE_MINUTES} دقائق)</span>
        </div>
        {liveVisits.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {liveVisits.slice(0, 8).map((v, i) => (
              <li key={i} className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm">
                <Flag code={v.country} />
                <span className="font-bold text-foreground">{placeAr(v.city, v.country)}</span>
                <span className="text-muted">· يتصفح «{pageName(v.pages.at(-1)?.path ?? "/")}»</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* الخلاصة */}
      <section className={`${card} bg-gradient-to-br from-accent/10 to-transparent`}>
        <h2 className="text-lg font-extrabold text-foreground">الخلاصة في سطور</h2>
        <p className="mt-1 text-sm text-muted">ملخّص تلقائي لأهم ما تقوله الأرقام في هذه الفترة.</p>
        <ul className="mt-4 space-y-2.5">
          {insights.map((x, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-7 text-foreground">
              <span aria-hidden="true">{x.icon}</span>
              <span className={x.tone === "warn" ? "font-bold text-amber-700 dark:text-amber-400" : ""}>{x.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* الأرقام الأساسية */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi label="الزوار" value={fmt.format(stats.visits)} note="عدد الزوار المختلفين (كل جلسة تصفّح تُحسب مرة واحدة)." delta={<Delta now={stats.visits} before={stats.previous.visits} />} />
        <Kpi label="مشاهدات الصفحات" value={fmt.format(stats.pageViews)} note={`بمعدل ${stats.engagement.avgPages.toFixed(1)} صفحة لكل زائر.`} delta={<Delta now={stats.pageViews} before={stats.previous.pageViews} />} />
        <Kpi label="متوسط مدة الزيارة" value={durationLabel(stats.engagement.avgSeconds)} note="كم يقضي الزائر في الموقع عادةً." />
        <Kpi label="نسبة المغادرة السريعة" value={`${Math.round(stats.engagement.bounceRate * 100)}%`} note="زوار غادروا بعد صفحة واحدة. كلما قلّت النسبة كان ذلك أفضل." />
        <Kpi label="نقرات التواصل" value={fmt.format(stats.contactClicks)} note="واتساب واتصال وبريد وفيسبوك وإنستغرام." />
        <Kpi label="طلبات من النموذج" value={fmt.format(stats.forms)} note={`نسبة التحويل ${pct(stats.forms, stats.visits)}% من الزوار.`} />
      </div>

      <Section title="الزوار عبر الزمن" hint="كل عمود يمثل يوماً أو أسبوعاً أو شهراً بحسب الفترة المختارة.">
        <VisitsChart stats={stats} />
      </Section>

      {/* الدول والمدن */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="من أي دولة يأتي الزوار؟" hint="الدولة تُحدَّد من عنوان الزائر دون تخزين العنوان نفسه.">
          {countries.length === 0 ? (
            <Empty />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                {places.map((c) => (
                  <span key={c.continent} className="rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-foreground">
                    {CONTINENT_LABEL[c.continent]} <span className="font-normal text-muted">{c.visits} · {pct(c.visits, totalVisits)}%</span>
                  </span>
                ))}
              </div>
              <ul className="space-y-3">
                {countries.slice(0, 10).map((c) => (
                  <li key={c.country} className="flex items-center gap-3">
                    <Flag code={c.country} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="truncate font-bold text-foreground">{c.country ? countryAr(c.country) : "غير معروف"}</span>
                        <span className="shrink-0 text-muted">{c.visits} · {pct(c.visits, totalVisits)}%</span>
                      </div>
                      <Bar value={c.visits} max={maxCountry} />
                    </div>
                  </li>
                ))}
              </ul>
              {countries.length > 10 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-bold text-accent-strong">عرض باقي الدول ({countries.length - 10})</summary>
                  <ul className="mt-3 space-y-2">
                    {countries.slice(10).map((c) => (
                      <li key={c.country} className="flex items-center gap-3 text-sm">
                        <Flag code={c.country} />
                        <span className="flex-1 text-foreground">{c.country ? countryAr(c.country) : "غير معروف"}</span>
                        <span className="text-muted">{c.visits}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </Section>

        <Section title="من أي مدينة؟" hint="أكثر 40 مدينة زيارةً.">
          {stats.cities.length === 0 ? (
            <Empty />
          ) : (
            <ul className="max-h-[30rem] space-y-3 overflow-y-auto pe-1">
              {stats.cities.map((c) => (
                <li key={`${c.country}|${c.city}`} className="flex items-center gap-3">
                  <Flag code={c.country} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="truncate font-bold text-foreground">
                        {cityAr(c.city)} <span className="font-normal text-muted">· {countryAr(c.country)}</span>
                      </span>
                      <span className="shrink-0 text-muted">{c.visits}</span>
                    </div>
                    <Bar value={c.visits} max={maxCity} className="bg-accent-strong" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* رحلة الزائر نحو التواصل */}
      <Section title="رحلة الزائر نحو التواصل" hint="كم زائراً وصل إلى كل خطوة. الفرق بين الخطوات يُظهر أين يتوقف الزوار.">
        {f.visitors === 0 ? (
          <Empty />
        ) : (
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={s.label}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-bold text-foreground">
                    {i + 1}. {s.label}
                  </span>
                  <span className="shrink-0 text-muted">
                    {s.n} · {pct(s.n, f.visitors)}%
                  </span>
                </div>
                <Bar value={s.n} max={f.visitors} className={i >= 3 ? "bg-green-500" : "bg-accent"} />
                <p className="mt-1 text-xs text-muted">{s.hint}</p>
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* ماذا ضغطوا والصفحات */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="ماذا ضغط الزوار؟" hint="النقرات على وسائل التواصل وإرسال النموذج.">
          {stats.clicks.length === 0 ? (
            <Empty text="لم يضغط أحد على وسائل التواصل في هذه الفترة بعد." />
          ) : (
            <>
              <ul className="space-y-3">
                {stats.clicks.map((c) => (
                  <li key={c.kind}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="font-bold text-foreground">{KIND_LABEL[c.kind] ?? c.kind}</span>
                      <span className="text-muted">{c.clicks} مرة · {c.visitors} {c.visitors === 1 ? "زائر" : "زوار"}</span>
                    </div>
                    <Bar value={c.clicks} max={maxClick} className={c.kind === "form" ? "bg-green-500" : "bg-accent"} />
                  </li>
                ))}
              </ul>
              <h3 className="mt-6 text-sm font-extrabold text-foreground">من أي صفحة ضغطوا؟</h3>
              <table className="mt-2 w-full text-sm">
                <tbody>
                  {stats.clicksByPage.map((c) => (
                    <tr key={`${c.path}|${c.kind}`} className="border-t border-border">
                      <td className={td}>{c.path ? pageName(c.path) : "—"}</td>
                      <td className={td}>{KIND_LABEL[c.kind] ?? c.kind}</td>
                      <td className={`${td} text-end`}>{c.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-muted">إجمالي النقرات: {clickTotal}</p>
            </>
          )}
        </Section>

        <Section title="أكثر الصفحات مشاهدة">
          {stats.pages.length === 0 ? (
            <Empty />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr><th className={th}>الصفحة</th><th className={`${th} text-end`}>المشاهدات</th><th className={`${th} text-end`}>الزوار</th></tr>
              </thead>
              <tbody>
                {stats.pages.map((p) => (
                  <tr key={p.path} className="border-t border-border">
                    <td className={td}>
                      <a href={p.path} className="font-bold text-accent-strong hover:underline">{pageName(p.path)}</a>
                    </td>
                    <td className={`${td} text-end`}>{p.views}</td>
                    <td className={`${td} text-end`}>{p.visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      </div>

      {/* المصادر */}
      <Section title="من أين جاء الزوار؟" hint="مصدر الدخول الأول لكل زائر: إعلان أو بحث أو منصة تواصل أو دخول مباشر.">
        {stats.sources.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className={th}>المصدر</th><th className={th}>الحملة</th><th className={`${th} text-end`}>الزوار</th>
                  <th className={`${th} text-end`}>نقرات التواصل</th><th className={`${th} text-end`}>نماذج مُرسلة</th>
                </tr>
              </thead>
              <tbody>
                {stats.sources.map((s) => (
                  <tr key={`${s.source}|${s.medium}|${s.campaign}`} className="border-t border-border">
                    <td className={`${td} font-bold text-foreground`}>{s.source === "direct" ? "دخول مباشر" : sourceName(s)}</td>
                    <td className={td}><bdi>{s.campaign ?? "—"}</bdi></td>
                    <td className={`${td} text-end`}>{s.visits}</td>
                    <td className={`${td} text-end`}>{s.clicks}</td>
                    <td className={`${td} text-end`}>{s.forms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* الأوقات والأجهزة */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="متى يزورك الناس؟" hint="بتوقيت القاهرة. العمود البرتقالي الغامق هو الأكثر ازدحاماً.">
          {stats.visits === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-bold text-foreground">ساعات اليوم</p>
                <Columns values={stats.hours} labels={stats.hours.map((_, h) => hourLabel(h))} caption="الزيارات حسب ساعة اليوم" />
                <div className="mt-1 flex justify-between text-xs text-muted" dir="ltr">
                  <span>12 ص</span><span>6 ص</span><span>12 ظ</span><span>6 م</span><span>11 م</span>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-bold text-foreground">أيام الأسبوع</p>
                <Columns values={stats.weekdays} labels={WEEKDAY_AR} caption="الزيارات حسب يوم الأسبوع" />
                <div className="mt-1 flex text-center text-[11px] text-muted" dir="ltr">
                  {WEEKDAY_AR.map((d) => (
                    <span key={d} className="flex-1">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Section>

        <Section title="بماذا يتصفحون؟">
          {stats.visits === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-bold text-foreground">الأجهزة</p>
                <ul className="space-y-3">
                  {stats.devices.map((d) => (
                    <li key={d.device}>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{DEVICE_LABEL[d.device] ?? d.device}</span>
                        <span className="text-muted">{d.visits} · {pct(d.visits, stats.visits)}%</span>
                      </div>
                      <Bar value={d.visits} max={deviceMax} />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-3 text-sm font-bold text-foreground">المتصفحات</p>
                <ul className="space-y-3">
                  {stats.browsers.map((b) => (
                    <li key={b.browser}>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{browserLabel(b.browser) || "غير معروف"}</span>
                        <span className="text-muted">{b.visits} · {pct(b.visits, stats.visits)}%</span>
                      </div>
                      <Bar value={b.visits} max={browserMax} className="bg-accent-strong" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Section>
      </div>

      {/* آخر الزيارات */}
      <Section id="visits" title="تتبّع الزوار واحداً واحداً" hint={`آخر ${stats.recent.length} زيارة. اضغط على أي زيارة لترى رحلتها كاملة، أو استخدم الأزرار للتصفية.`}>
        {views.length === 0 ? <Empty /> : <RecentVisits visits={views} />}
      </Section>
    </div>
  );
}
