// Numbers for the owner's statistics page (/admin/stats): visits per day,
// countries and cities, most viewed pages, clicks, which ad or source brought
// visits, and the latest visits one by one. Reads the anonymous visitor tables
// (lib/visits.ts); sessions driven by an automated browser (navigator.webdriver)
// are left out. A table that doesn't exist yet reads as empty. Same pattern
// as hadarahospitality's lib/site-stats.ts.
import { classifyVisit, type PageFacts, type Verdict } from './visit-insights';
import type { Sql } from './visits';

export const STAT_RANGES = [1, 7, 30, 90, 365] as const;
export type StatRange = (typeof STAT_RANGES)[number];

export function statRange(value: string | null | undefined): StatRange {
  const n = Number(value);
  return (STAT_RANGES as readonly number[]).includes(n) ? (n as StatRange) : 30;
}

export interface SourceRow {
  source: string;
  medium: string;
  campaign: string | null;
  visits: number;
  forms: number;
  clicks: number;
}

export interface ClickRow {
  kind: string;
  clicks: number;
  visitors: number;
}

export interface RecentVisit {
  startedAt: string;
  /** The latest page view of the session. */
  lastAt: string;
  country: string | null;
  city: string | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  referrer: string | null;
  device: string | null;
  os: string | null;
  browser: string | null;
  /** Pages in order, each with the seconds spent on it (null for the last one). */
  pages: { path: string; seconds: number | null }[];
  clicks: { kind: string; path: string | null }[];
  verdict: Verdict;
  reasons: string[];
}

export interface SiteStats {
  days: StatRange;
  visits: number;
  pageViews: number;
  forms: number;
  contactClicks: number;
  daily: { day: string; visits: number }[];
  countries: { country: string; visits: number }[];
  cities: { country: string; city: string; visits: number }[];
  pages: { path: string; views: number; visitors: number }[];
  clicks: ClickRow[];
  clicksByPage: { path: string; kind: string; clicks: number }[];
  sources: SourceRow[];
  devices: { device: string; visits: number }[];
  browsers: { browser: string; visits: number }[];
  recent: RecentVisit[];
  /** The same totals for the period just before this one, to show the change. */
  previous: { visits: number; pageViews: number };
  /** Visitors who opened or changed a page in the last 10 minutes. */
  onlineNow: number;
  /** The database clock when the numbers were read, so "minutes ago" never depends on the page's own clock. */
  now: string;
  engagement: { avgPages: number; bounceRate: number; avgSeconds: number | null };
  /** Visits by hour of day (0–23) and by weekday (0 = Sunday), in Cairo time. */
  hours: number[];
  weekdays: number[];
  /** Visitors at each step toward contacting the company. */
  funnel: { visitors: number; engaged: number; intent: number; clicked: number; submitted: number };
}

export const ONLINE_MINUTES = 10;

const TIME_ZONE = 'Africa/Cairo';

const missing = (error: unknown) => ['42P01', '42703'].includes(String((error as { code?: string }).code));

async function rows(query: Promise<Record<string, unknown>[]>): Promise<Record<string, unknown>[]> {
  try {
    return await query;
  } catch (error) {
    if (missing(error)) return [];
    throw error;
  }
}

const num = (v: unknown) => Number(v) || 0;

/** The database clock as an ISO string; this machine's own clock when the table was empty or missing. */
function databaseTime(value: unknown): string {
  const date = value instanceof Date ? value : new Date(String(value ?? ''));
  return (Number.isNaN(date.getTime()) ? new Date() : date).toISOString();
}
const text = (v: unknown) => (typeof v === 'string' && v ? v : null);

/** Every day of the range, oldest first, in Cairo time ("2026-10-02"). */
export function rangeDays(days: number, now = new Date()): string[] {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
  return Array.from({ length: days }, (_, i) => fmt.format(new Date(now.getTime() - (days - 1 - i) * 86_400_000)));
}

/** Merges per-source visits and clicks into one row per source/medium/campaign, most visits first. */
export function mergeSources(visits: Record<string, unknown>[], actions: Record<string, unknown>[]): SourceRow[] {
  const map = new Map<string, SourceRow>();
  const row = (r: Record<string, unknown>) => {
    const source = text(r.source) ?? 'unknown';
    const medium = text(r.medium) ?? 'unknown';
    const campaign = text(r.campaign);
    const key = `${source}|${medium}|${campaign ?? ''}`;
    let entry = map.get(key);
    if (!entry) {
      entry = { source, medium, campaign, visits: 0, forms: 0, clicks: 0 };
      map.set(key, entry);
    }
    return entry;
  };
  for (const r of visits) row(r).visits += num(r.n);
  for (const r of actions) {
    const entry = row(r);
    if (text(r.kind) === 'form') entry.forms += num(r.n);
    else entry.clicks += num(r.n);
  }
  return [...map.values()].sort((a, b) => b.forms - a.forms || b.clicks - a.clicks || b.visits - a.visits);
}

type RawPage = { path?: unknown; at?: unknown; active?: unknown; scroll?: unknown; interactions?: unknown };
const optional = (value: unknown) => (value == null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value));
const asList = <T>(value: unknown): T[] => {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  return Array.isArray(parsed) ? (parsed as T[]) : [];
};

/** One recent session, with the same "is it a person" verdict as the Telegram alert. */
export function toRecentVisit(r: Record<string, unknown>): RecentVisit {
  const raw = asList<RawPage>(r.trail);
  const start = Number(raw[0]?.at) || 0;
  const trail: PageFacts[] = raw.map((p) => {
    const page: PageFacts = { path: String(p.path ?? ''), at: Math.max(0, Math.round(Number(p.at) - start)) || 0 };
    const active = optional(p.active);
    const scroll = optional(p.scroll);
    const interactions = optional(p.interactions);
    if (active != null) page.active = active;
    if (scroll != null) page.scroll = scroll;
    if (interactions != null) page.interactions = interactions;
    return page;
  });
  const clicks = asList<{ kind?: unknown; path?: unknown }>(r.clicks).map((c) => ({ kind: String(c.kind ?? ''), path: text(c.path) }));
  const { verdict, reasons } = classifyVisit({
    city: text(r.city),
    country: text(r.country),
    source: text(r.source),
    medium: text(r.medium),
    campaign: text(r.campaign),
    referrer: text(r.referrer),
    device: text(r.device),
    os: text(r.os),
    browser: text(r.browser),
    tz: text(r.tz),
    screen: text(r.screen),
    webdriver: typeof r.webdriver === 'boolean' ? r.webdriver : null,
    pages: trail,
    actions: clicks.map((c) => c.kind),
  });
  return {
    startedAt: (r.started instanceof Date ? r.started : new Date(String(r.started))).toISOString(),
    lastAt: (r.last instanceof Date ? r.last : new Date(String(r.last ?? r.started))).toISOString(),
    country: text(r.country),
    city: text(r.city),
    source: text(r.source),
    medium: text(r.medium),
    campaign: text(r.campaign),
    referrer: text(r.referrer),
    device: text(r.device),
    os: text(r.os),
    browser: text(r.browser),
    pages: trail.map((p, i) => ({ path: p.path, seconds: trail[i + 1] ? Math.max(0, trail[i + 1].at - p.at) : null })),
    clicks,
    verdict,
    reasons,
  };
}

export async function loadSiteStats(sql: Sql, days: StatRange): Promise<SiteStats> {
  const [totals, daily, countries, cities, pages, sourceVisits, actionsBySource, clicks, clicksByPage, devices, browsers, recent, previous, online, engagement, hours, funnel] =
    await Promise.all([
      rows(sql`SELECT count(DISTINCT session_id)::int AS visits, count(*)::int AS views
        FROM visitor_events WHERE created_at >= now() - make_interval(days => ${days}) AND coalesce(webdriver, false) = false`),
      rows(sql`SELECT to_char(created_at AT TIME ZONE 'Africa/Cairo', 'YYYY-MM-DD') AS day, count(DISTINCT session_id)::int AS visits
        FROM visitor_events WHERE created_at >= now() - make_interval(days => ${days}) AND coalesce(webdriver, false) = false GROUP BY 1`),
      rows(sql`SELECT coalesce(country, '') AS country, count(*)::int AS visits FROM (
          SELECT DISTINCT ON (session_id) session_id, country FROM visitor_events
          WHERE created_at >= now() - make_interval(days => ${days}) AND coalesce(webdriver, false) = false ORDER BY session_id, created_at
        ) s GROUP BY 1 ORDER BY 2 DESC LIMIT 300`),
      rows(sql`SELECT coalesce(country, '') AS country, city, count(*)::int AS visits FROM (
          SELECT DISTINCT ON (session_id) session_id, country, city FROM visitor_events
          WHERE created_at >= now() - make_interval(days => ${days}) AND coalesce(webdriver, false) = false ORDER BY session_id, created_at
        ) s WHERE city IS NOT NULL AND city <> '' GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 40`),
      rows(sql`SELECT path, count(*)::int AS views, count(DISTINCT session_id)::int AS visitors
        FROM visitor_events WHERE created_at >= now() - make_interval(days => ${days}) AND coalesce(webdriver, false) = false
        GROUP BY 1 ORDER BY 2 DESC LIMIT 20`),
      // A session's source is set on its first event only.
      rows(sql`SELECT source, medium, campaign, count(*)::int AS n FROM (
          SELECT DISTINCT ON (session_id) session_id, source, medium, campaign FROM visitor_events
          WHERE created_at >= now() - make_interval(days => ${days}) AND coalesce(webdriver, false) = false ORDER BY session_id, created_at
        ) s GROUP BY 1, 2, 3`),
      rows(sql`SELECT f.source, f.medium, f.campaign, a.kind, count(*)::int AS n
        FROM visitor_actions a
        LEFT JOIN LATERAL (
          SELECT source, medium, campaign FROM visitor_events e WHERE e.session_id = a.session_id ORDER BY created_at LIMIT 1
        ) f ON true
        WHERE a.created_at >= now() - make_interval(days => ${days})
        GROUP BY 1, 2, 3, 4`),
      rows(sql`SELECT kind, count(*)::int AS clicks, count(DISTINCT session_id)::int AS visitors
        FROM visitor_actions WHERE created_at >= now() - make_interval(days => ${days}) GROUP BY 1 ORDER BY 2 DESC`),
      rows(sql`SELECT coalesce(path, '') AS path, kind, count(*)::int AS clicks
        FROM visitor_actions WHERE created_at >= now() - make_interval(days => ${days})
        GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 20`),
      rows(sql`SELECT coalesce(device, '') AS device, count(*)::int AS visits FROM (
          SELECT DISTINCT ON (session_id) session_id, device FROM visitor_events
          WHERE created_at >= now() - make_interval(days => ${days}) AND coalesce(webdriver, false) = false ORDER BY session_id, created_at
        ) s GROUP BY 1 ORDER BY 2 DESC`),
      rows(sql`SELECT coalesce(browser, '') AS browser, count(*)::int AS visits FROM (
          SELECT DISTINCT ON (session_id) session_id, browser FROM visitor_events
          WHERE created_at >= now() - make_interval(days => ${days}) AND coalesce(webdriver, false) = false ORDER BY session_id, created_at
        ) s GROUP BY 1 ORDER BY 2 DESC LIMIT 8`),
      rows(sql`SELECT s.started, s.last, f.country, f.city, f.source, f.medium, f.campaign, f.referrer, f.device, f.os, f.browser,
          f.tz, f.screen, f.webdriver,
          (SELECT json_agg(json_build_object('path', v.path, 'at', extract(epoch FROM v.created_at)::float8,
            'active', v.active_seconds, 'scroll', v.scroll_pct, 'interactions', v.interactions) ORDER BY v.created_at)
            FROM visitor_events v WHERE v.session_id = s.session_id) AS trail,
          (SELECT json_agg(json_build_object('kind', a.kind, 'path', a.path) ORDER BY a.created_at)
            FROM visitor_actions a WHERE a.session_id = s.session_id) AS clicks
        FROM (
          SELECT session_id, min(created_at) AS started, max(created_at) AS last FROM visitor_events
          WHERE created_at >= now() - make_interval(days => ${days}) AND coalesce(webdriver, false) = false GROUP BY session_id ORDER BY 2 DESC LIMIT 80
        ) s
        LEFT JOIN LATERAL (SELECT * FROM visitor_events e WHERE e.session_id = s.session_id ORDER BY created_at LIMIT 1) f ON true
        ORDER BY s.started DESC`),
      rows(sql`SELECT count(DISTINCT session_id)::int AS visits, count(*)::int AS views FROM visitor_events
        WHERE created_at >= now() - make_interval(days => ${days * 2}) AND created_at < now() - make_interval(days => ${days})
          AND coalesce(webdriver, false) = false`),
      rows(sql`SELECT count(DISTINCT session_id)::int AS n, now() AS now FROM visitor_events
        WHERE created_at >= now() - make_interval(mins => ${ONLINE_MINUTES}) AND coalesce(webdriver, false) = false`),
      // Pages per visit, the share that left after one page, and the time spent (the larger of
      // the span between page views and the seconds the pages were visible).
      rows(sql`SELECT avg(pages)::float8 AS avg_pages, avg(CASE WHEN pages = 1 THEN 1.0 ELSE 0.0 END)::float8 AS bounce,
          avg(CASE WHEN seconds > 0 THEN seconds END)::float8 AS avg_seconds
        FROM (
          SELECT session_id, count(*) AS pages,
            greatest(extract(epoch FROM max(created_at) - min(created_at)), coalesce(sum(active_seconds), 0))::float8 AS seconds
          FROM visitor_events WHERE created_at >= now() - make_interval(days => ${days}) AND coalesce(webdriver, false) = false
          GROUP BY session_id
        ) s`),
      rows(sql`SELECT 'h' AS kind, extract(hour FROM started AT TIME ZONE 'Africa/Cairo')::int AS n, count(*)::int AS visits FROM (
          SELECT session_id, min(created_at) AS started FROM visitor_events
          WHERE created_at >= now() - make_interval(days => ${days}) AND coalesce(webdriver, false) = false GROUP BY session_id
        ) s GROUP BY 2
        UNION ALL
        SELECT 'd', extract(dow FROM started AT TIME ZONE 'Africa/Cairo')::int, count(*)::int FROM (
          SELECT session_id, min(created_at) AS started FROM visitor_events
          WHERE created_at >= now() - make_interval(days => ${days}) AND coalesce(webdriver, false) = false GROUP BY session_id
        ) s GROUP BY 2`),
      rows(sql`SELECT count(*)::int AS visitors,
          count(*) FILTER (WHERE pages >= 2 OR visible >= 15)::int AS engaged,
          count(*) FILTER (WHERE intent)::int AS intent,
          count(*) FILTER (WHERE clicked)::int AS clicked,
          count(*) FILTER (WHERE submitted)::int AS submitted
        FROM (
          SELECT e.session_id, count(*) AS pages, coalesce(sum(e.active_seconds), 0) AS visible,
            bool_or(e.path IN ('/contact', '/lp')) AS intent,
            EXISTS (SELECT 1 FROM visitor_actions a WHERE a.session_id = e.session_id AND a.kind <> 'form'
              AND a.created_at >= now() - make_interval(days => ${days})) AS clicked,
            EXISTS (SELECT 1 FROM visitor_actions a WHERE a.session_id = e.session_id AND a.kind = 'form'
              AND a.created_at >= now() - make_interval(days => ${days})) AS submitted
          FROM visitor_events e
          WHERE e.created_at >= now() - make_interval(days => ${days}) AND coalesce(e.webdriver, false) = false
          GROUP BY e.session_id
        ) s`),
    ]);

  const perDay = new Map(daily.map((r) => [String(r.day), num(r.visits)]));
  const sources = mergeSources(sourceVisits, actionsBySource);
  return {
    days,
    visits: num(totals[0]?.visits),
    pageViews: num(totals[0]?.views),
    forms: clicks.filter((r) => r.kind === 'form').reduce((n, r) => n + num(r.clicks), 0),
    contactClicks: clicks.filter((r) => r.kind !== 'form').reduce((n, r) => n + num(r.clicks), 0),
    daily: rangeDays(days).map((day) => ({ day, visits: perDay.get(day) ?? 0 })),
    countries: countries.map((r) => ({ country: text(r.country) ?? '', visits: num(r.visits) })),
    cities: cities.map((r) => ({ country: text(r.country) ?? '', city: String(r.city), visits: num(r.visits) })),
    pages: pages.map((r) => ({ path: String(r.path), views: num(r.views), visitors: num(r.visitors) })),
    clicks: clicks.map((r) => ({ kind: String(r.kind), clicks: num(r.clicks), visitors: num(r.visitors) })),
    clicksByPage: clicksByPage.map((r) => ({ path: String(r.path), kind: String(r.kind), clicks: num(r.clicks) })),
    sources,
    devices: devices.map((r) => ({ device: text(r.device) ?? '', visits: num(r.visits) })),
    browsers: browsers.map((r) => ({ browser: text(r.browser) ?? '', visits: num(r.visits) })),
    recent: recent.map(toRecentVisit),
    previous: { visits: num(previous[0]?.visits), pageViews: num(previous[0]?.views) },
    onlineNow: num(online[0]?.n),
    now: databaseTime(online[0]?.now),
    engagement: {
      avgPages: num(engagement[0]?.avg_pages),
      bounceRate: num(engagement[0]?.bounce),
      avgSeconds: engagement[0]?.avg_seconds == null ? null : num(engagement[0].avg_seconds),
    },
    hours: Array.from({ length: 24 }, (_, h) => num(hours.find((r) => r.kind === 'h' && num(r.n) === h)?.visits)),
    weekdays: Array.from({ length: 7 }, (_, d) => num(hours.find((r) => r.kind === 'd' && num(r.n) === d)?.visits)),
    funnel: {
      visitors: num(funnel[0]?.visitors),
      engaged: num(funnel[0]?.engaged),
      intent: num(funnel[0]?.intent),
      clicked: num(funnel[0]?.clicked),
      submitted: num(funnel[0]?.submitted),
    },
  };
}
