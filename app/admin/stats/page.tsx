import type { Metadata } from "next";
import Link from "next/link";
import { sourceLabel } from "@/lib/attribution";
import { CONTINENT_LABEL, REGION_LABEL, groupByPlace } from "@/lib/geo-regions";
import { pageName } from "@/lib/page-names";
import { loadSiteStats, statRange, STAT_RANGES, type SiteStats } from "@/lib/site-stats";
import { isStatsAuthed, statsConfigured } from "@/lib/stats-auth";
import { VERDICT_LABEL } from "@/lib/visit-insights";
import { pageTime, visitsSql } from "@/lib/visits";

export const metadata: Metadata = {
  title: "إحصاءات الزوار",
  robots: { index: false, follow: false },
};

const RANGE_LABEL: Record<number, string> = { 1: "آخر 24 ساعة", 7: "7 أيام", 30: "30 يوماً", 90: "90 يوماً", 365: "سنة" };
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
const when = (iso: string) =>
  new Intl.DateTimeFormat("ar-EG-u-nu-latn", { timeZone: "Africa/Cairo", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const pct = (part: number, whole: number) => (whole > 0 ? `${((part / whole) * 100).toFixed(1)}%` : "—");

const regionNames = new Intl.DisplayNames(["ar"], { type: "region" });
function countryName(code: string | null) {
  if (!code) return "غير معروف";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

const sourceName = (s: { source: string | null; medium: string | null }) =>
  !s.source || !s.medium || s.medium === "unknown" ? "غير مسجّل" : sourceLabel({ source: s.source, medium: s.medium as never });

const card = "rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6";
const th = "px-3 py-2 text-start text-xs font-bold text-muted";
const td = "px-3 py-2 align-top";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className={card}>
      <h2 className="text-lg font-extrabold text-foreground">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const Empty = () => <p className="text-sm text-muted">لا توجد بيانات في هذه الفترة بعد.</p>;

function LoginForm({ error }: { error: boolean }) {
  return (
    <div className="mx-auto max-w-sm px-5 py-24">
      <form method="post" action="/api/stats/login" className={`${card} space-y-4`}>
        <h1 className="text-xl font-extrabold text-foreground">إحصاءات الزوار</h1>
        <p className="text-sm text-muted">هذه الصفحة خاصة بإدارة الموقع. أدخل كلمة المرور للمتابعة.</p>
        <label className="block text-sm font-bold text-foreground" htmlFor="password">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none focus:border-accent"
        />
        {error && (
          <p role="alert" className="text-sm font-bold text-red-600">
            كلمة المرور غير صحيحة.
          </p>
        )}
        <button type="submit" className="w-full rounded-xl bg-accent px-4 py-2.5 font-bold text-accent-foreground hover:bg-accent-strong">
          دخول
        </button>
      </form>
    </div>
  );
}

function Chart({ stats }: { stats: SiteStats }) {
  // Days up to a month, weeks for 90 days, months for a year; the last 24 hours show the one day.
  const dayLabel = (d: string) =>
    new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`));
  type Bar = { label: string; visits: number };
  let bars: Bar[];
  if (stats.days <= 30) {
    bars = stats.daily.map((d) => ({ label: dayLabel(d.day), visits: d.visits }));
  } else {
    const size = stats.days === 90 ? 7 : 0;
    const groups = new Map<string, Bar>();
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
  const height = 180;
  const gap = 2;
  const barWidth = bars.length ? (width - gap * (bars.length - 1)) / bars.length : 0;
  return (
    <>
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
    </>
  );
}

function Dashboard({ stats }: { stats: SiteStats }) {
  const places = groupByPlace(stats.countries);
  const placesTotal = places.reduce((n, c) => n + c.visits, 0);
  const contactTotal = stats.contactClicks;
  const likelyBots = stats.recent.filter((r) => r.verdict === "bot").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "الزيارات", value: fmt.format(stats.visits), note: `${fmt.format(stats.pageViews)} مشاهدة صفحة` },
          { label: "نقرات التواصل", value: fmt.format(contactTotal), note: "واتساب واتصال وبريد ومنصات التواصل" },
          { label: "نماذج مُرسلة", value: fmt.format(stats.forms), note: "طلبات من نموذج التواصل" },
          { label: "نسبة التحويل", value: pct(stats.forms, stats.visits), note: "نماذج مُرسلة لكل زيارة" },
        ].map((k) => (
          <div key={k.label} className={card}>
            <p className="text-sm font-bold text-muted">{k.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-foreground" dir="ltr">{k.value}</p>
            <p className="mt-1 text-xs text-muted">{k.note}</p>
          </div>
        ))}
      </div>

      <Section title="الزيارات عبر الزمن" hint="تُحسب الجلسة مرة واحدة، وتُستثنى الزيارات التي يديرها متصفح آلي.">
        <Chart stats={stats} />
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="الزوار حسب الدولة" hint="يُحدَّد البلد من عنوان الزائر دون تخزين العنوان نفسه.">
          {places.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-2">
              {places.map((c, i) => (
                <details key={c.continent} open={i === 0} className="rounded-xl border border-border bg-background px-4 py-2">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-foreground marker:content-none">
                    <span>{CONTINENT_LABEL[c.continent]}</span>
                    <span className="text-sm font-normal text-muted">{c.visits} · {pct(c.visits, placesTotal)}</span>
                  </summary>
                  {c.regions.map((r) => (
                    <div key={r.region} className="mt-2">
                      {c.regions.length > 1 && (
                        <p className="flex justify-between text-xs font-bold text-muted">
                          <span>{REGION_LABEL[r.region]}</span>
                          <span>{r.visits}</span>
                        </p>
                      )}
                      <table className="w-full text-sm">
                        <tbody>
                          {r.countries.map((x) => (
                            <tr key={x.country} className="border-t border-border">
                              <td className={td}>{countryName(x.country)}</td>
                              <td className={`${td} text-end`}>{x.visits}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </details>
              ))}
            </div>
          )}
        </Section>

        <Section title="الزوار حسب المدينة" hint="أكثر 40 مدينة زيارةً.">
          {stats.cities.length === 0 ? (
            <Empty />
          ) : (
            <div className="max-h-[28rem] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr><th className={th}>المدينة</th><th className={th}>الدولة</th><th className={`${th} text-end`}>الزيارات</th></tr>
                </thead>
                <tbody>
                  {stats.cities.map((c) => (
                    <tr key={`${c.country}|${c.city}`} className="border-t border-border">
                      <td className={td}><bdi>{c.city}</bdi></td>
                      <td className={td}>{countryName(c.country)}</td>
                      <td className={`${td} text-end`}>{c.visits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="ماذا ضغط الزوار؟" hint="النقرات على وسائل التواصل وإرسال النموذج.">
          {stats.clicks.length === 0 ? (
            <Empty />
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr><th className={th}>الإجراء</th><th className={`${th} text-end`}>المرات</th><th className={`${th} text-end`}>الزوار</th></tr>
                </thead>
                <tbody>
                  {stats.clicks.map((c) => (
                    <tr key={c.kind} className="border-t border-border">
                      <td className={td}>{KIND_LABEL[c.kind] ?? c.kind}</td>
                      <td className={`${td} text-end`}>{c.clicks}</td>
                      <td className={`${td} text-end`}>{c.visitors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 className="mt-5 text-sm font-extrabold text-foreground">من أي صفحة ضغطوا؟</h3>
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
                      <Link href={p.path} className="font-bold text-accent-strong hover:underline">{pageName(p.path)}</Link>
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

      <Section title="من أين جاء الزوار؟" hint="مصدر الزيارة الأولى لكل جلسة: إعلان أو بحث أو منصة تواصل أو دخول مباشر.">
        {stats.sources.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className={th}>المصدر</th><th className={th}>الحملة</th><th className={`${th} text-end`}>الزيارات</th>
                  <th className={`${th} text-end`}>نقرات التواصل</th><th className={`${th} text-end`}>نماذج مُرسلة</th>
                </tr>
              </thead>
              <tbody>
                {stats.sources.map((s) => (
                  <tr key={`${s.source}|${s.medium}|${s.campaign}`} className="border-t border-border">
                    <td className={td}>{sourceName(s)}</td>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="الأجهزة">
          {stats.devices.length === 0 ? <Empty /> : (
            <table className="w-full text-sm">
              <tbody>
                {stats.devices.map((d) => (
                  <tr key={d.device} className="border-t border-border">
                    <td className={td}>{DEVICE_LABEL[d.device] ?? d.device}</td>
                    <td className={`${td} text-end`}>{d.visits} · {pct(d.visits, stats.visits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
        <Section title="المتصفحات">
          {stats.browsers.length === 0 ? <Empty /> : (
            <table className="w-full text-sm">
              <tbody>
                {stats.browsers.map((b) => (
                  <tr key={b.browser} className="border-t border-border">
                    <td className={td}>{b.browser || "غير معروف"}</td>
                    <td className={`${td} text-end`}>{b.visits} · {pct(b.visits, stats.visits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      </div>

      <Section
        title="آخر الزيارات"
        hint={`آخر ${stats.recent.length} زيارة بالتفصيل: المكان والجهاز والمصدر والصفحات التي تصفحها وما ضغطه${likelyBots ? ` (منها ${likelyBots} آلية على الأرجح)` : ""}.`}
      >
        {stats.recent.length === 0 ? (
          <Empty />
        ) : (
          <ul className="divide-y divide-border">
            {stats.recent.map((r, i) => (
              <li key={i} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-foreground">
                    {[r.city, countryName(r.country)].filter(Boolean).join("، ")}
                    <span className="ms-2 text-sm font-normal text-muted">{when(r.startedAt)}</span>
                  </p>
                  <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-foreground">
                    {VERDICT_LABEL[r.verdict]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {[DEVICE_LABEL[r.device ?? ""] ?? r.device, r.os, r.browser].filter(Boolean).join(" · ")}
                  {" · "}المصدر: {r.source ? sourceName(r) : r.referrer ? <bdi>{r.referrer}</bdi> : "مباشر"}
                  {r.campaign ? <> · الحملة: <bdi>{r.campaign}</bdi></> : null}
                </p>
                <ol className="mt-2 list-inside list-decimal text-sm text-foreground">
                  {r.pages.map((p, n) => (
                    <li key={n}>
                      {pageName(p.path)}
                      {p.seconds != null && <span className="text-muted"> · {pageTime(p.seconds)}</span>}
                    </li>
                  ))}
                </ol>
                {r.clicks.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-2">
                    {r.clicks.map((c, n) => (
                      <span key={n} className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent-strong">
                        ضغط: {KIND_LABEL[c.kind] ?? c.kind}{c.path ? ` (${pageName(c.path)})` : ""}
                      </span>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ days?: string; error?: string }> }) {
  const params = await searchParams;

  if (!statsConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <div className={card}>
          <h1 className="text-xl font-extrabold text-foreground">إحصاءات الزوار</h1>
          <p className="mt-3 text-muted">
            الصفحة مغلقة حتى تُضاف كلمة مرور. أضف المتغير <code dir="ltr">STATS_PASSWORD</code> في إعدادات Vercel ثم أعد نشر الموقع.
          </p>
        </div>
      </div>
    );
  }
  if (!(await isStatsAuthed())) return <LoginForm error={params.error === "1"} />;

  const days = statRange(params.days);
  let stats: SiteStats | null = null;
  try {
    stats = await loadSiteStats(visitsSql(), days);
  } catch (error) {
    console.error("[stats] load failed", error instanceof Error ? error.message : error);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">إحصاءات الزوار</h1>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="الفترة" className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1">
            {STAT_RANGES.map((d) => (
              <Link
                key={d}
                href={`/admin/stats?days=${d}`}
                aria-current={d === days ? "page" : undefined}
                className="rounded-lg px-3 py-1.5 text-sm font-bold text-muted aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground"
              >
                {RANGE_LABEL[d]}
              </Link>
            ))}
          </nav>
          <form method="post" action="/api/stats/logout">
            <button type="submit" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-bold text-muted hover:text-foreground">
              تسجيل الخروج
            </button>
          </form>
        </div>
      </div>
      {stats ? (
        <Dashboard stats={stats} />
      ) : (
        <p className={card}>تعذّر تحميل الإحصاءات. تأكد من ربط قاعدة البيانات (POSTGRES_URL) ثم أعد المحاولة.</p>
      )}
    </div>
  );
}
