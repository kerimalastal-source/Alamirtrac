import type { Metadata } from "next";
import Link from "next/link";
import AutoRefresh from "@/components/stats/AutoRefresh";
import PasswordField from "@/components/PasswordField";
import { loadSiteStats, statRange, STAT_RANGES, type SiteStats } from "@/lib/site-stats";
import { isStatsAuthed, statsConfigured } from "@/lib/stats-auth";
import { visitsSql } from "@/lib/visits";
import Dashboard from "./Dashboard";

export const metadata: Metadata = {
  title: "إحصاءات الزوار",
  robots: { index: false, follow: false },
};

const RANGE_LABEL: Record<number, string> = { 1: "آخر 24 ساعة", 7: "7 أيام", 30: "30 يوماً", 90: "90 يوماً", 365: "سنة" };

const card = "rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6";

function LoginForm({ error }: { error: boolean }) {
  return (
    <div className="mx-auto max-w-sm px-5 py-24">
      <form method="post" action="/api/stats/login" className={`${card} space-y-4`}>
        <h1 className="text-xl font-extrabold text-foreground">إحصاءات الزوار</h1>
        <p className="text-sm text-muted">هذه الصفحة خاصة بإدارة الموقع. أدخل كلمة المرور للمتابعة.</p>
        <label className="block text-sm font-bold text-foreground" htmlFor="password">
          كلمة المرور
        </label>
        <PasswordField id="password" name="password" />
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
        <div>
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">إحصاءات الزوار</h1>
          <p className="mt-1 text-sm text-muted">كل ما يحدث على موقعك: من يزوره، ومن أين، وماذا يفعل.</p>
        </div>
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
      <div className="mb-6">
        <AutoRefresh />
      </div>
      {stats ? (
        <Dashboard stats={stats} />
      ) : (
        <p className={card}>تعذّر تحميل الإحصاءات. تأكد من ربط قاعدة البيانات (POSTGRES_URL) ثم أعد المحاولة.</p>
      )}
    </div>
  );
}
