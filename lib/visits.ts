// Anonymous visitor tracking: saving a page view and telling the team on
// Telegram. Used by app/api/visit/*; same pattern as hadarahospitality's
// lib/visits.ts.
//
// Nothing here identifies a person: the session is a random UUID kept in the
// tab's sessionStorage, the place comes from Vercel's geolocation headers, and
// neither the IP address nor the user agent is stored (only the device type,
// system and browser read from it, src/lib/visit-insights.ts).
import { neon } from '@neondatabase/serverless';
import { sourceLabel, type SourceMedium } from './attribution';
import { editTelegramMessage, sendTelegramMessage } from './telegram';
import { classifyVisit, deviceLabel, verdictLine, type PageFacts, type VisitFacts } from './visit-insights';

export interface Visit {
  sessionId: string;
  path: string;
  locale: string | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
  /** Where the visit came from (src/lib/attribution.ts); only sent with a session's first page. */
  source?: string | null;
  medium?: SourceMedium | null;
  campaign?: string | null;
  /** This page view's own id, so its engagement can be added when the page is left. */
  viewId?: string | null;
  /** Device type, system and browser (parseUserAgent), the browser's time zone, the screen size, and navigator.webdriver. */
  device?: string | null;
  os?: string | null;
  browser?: string | null;
  tz?: string | null;
  screen?: string | null;
  webdriver?: boolean | null;
}

/** What the session looked like when a page view was saved. */
export interface VisitState {
  /** No earlier event in this session. */
  first: boolean;
  /** Pages viewed so far, this one included. */
  pages: number;
  /** Seconds since the session's first page. */
  seconds: number;
  /** This path was not viewed earlier in the session. */
  newPage: boolean;
  /** The session's first page view (this one for a new session). */
  landing: Visit;
  /** The Telegram alert for this session, once it has been sent. */
  messageId: number | null;
  /** Every page of the session in order, this one last; `at` is seconds since the first page, with the engagement reported so far. */
  trail: PageFacts[];
  /** Other sessions that opened the same landing page within 10 seconds of this one's start. */
  burst: number;
}

/** The subset of Neon's query function this module uses, so tests can pass a fake. */
export interface Sql {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<Record<string, unknown>[]>;
  query(text: string): Promise<unknown>;
}

let cachedSql: Sql | undefined;
/** Neon client for the website's database (POSTGRES_URL, a Neon store linked from Vercel). */
export function visitsSql(): Sql {
  if (cachedSql) return cachedSql;
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL is not set.');
  cachedSql = neon(url) as unknown as Sql;
  return cachedSql;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Crawlers and automated browsers (Googlebot runs JavaScript too) are not visitors. */
export function isBot(userAgent: string | null): boolean {
  return !userAgent || /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|monitor|facebookexternalhit/i.test(userAgent);
}

/** API paths are never counted. */
export function isTrackedPath(path: string): boolean {
  return path.startsWith('/') && !/^\/api(\/|$)/.test(path);
}

/** Tables and indexes, created the first time a save finds one missing (no manual migration). */
export const visitorSchema = [
  `CREATE TABLE IF NOT EXISTS visitor_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  session_id text NOT NULL,
  path text NOT NULL,
  locale text,
  referrer text,
  country text,
  city text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
)`,
  'CREATE INDEX IF NOT EXISTS visitor_events_session_id_idx ON visitor_events USING btree (session_id)',
  'CREATE INDEX IF NOT EXISTS visitor_events_created_at_idx ON visitor_events USING btree (created_at)',
  // The Telegram message of each session, so later pages edit it instead of sending new ones.
  `CREATE TABLE IF NOT EXISTS visitor_alerts (
  session_id text PRIMARY KEY NOT NULL,
  message_id bigint NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
)`,
  // Where the visit came from, set on the session's first event (src/lib/attribution.ts).
  'ALTER TABLE visitor_events ADD COLUMN IF NOT EXISTS source text',
  'ALTER TABLE visitor_events ADD COLUMN IF NOT EXISTS medium text',
  'ALTER TABLE visitor_events ADD COLUMN IF NOT EXISTS campaign text',
  // Clicks on the WhatsApp button, email and phone links.
  `CREATE TABLE IF NOT EXISTS visitor_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  session_id text NOT NULL,
  kind text NOT NULL,
  path text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
)`,
  'CREATE INDEX IF NOT EXISTS visitor_actions_created_at_idx ON visitor_actions USING btree (created_at)',
  // Is it a person (2026-10-02, src/lib/visit-insights.ts): the device read
  // from the user agent, the browser's time zone and screen, and per page the
  // seconds it was visible, its deepest scroll and the seconds with input.
  'ALTER TABLE visitor_events ADD COLUMN IF NOT EXISTS view_id text',
  'ALTER TABLE visitor_events ADD COLUMN IF NOT EXISTS device text',
  'ALTER TABLE visitor_events ADD COLUMN IF NOT EXISTS os text',
  'ALTER TABLE visitor_events ADD COLUMN IF NOT EXISTS browser text',
  'ALTER TABLE visitor_events ADD COLUMN IF NOT EXISTS tz text',
  'ALTER TABLE visitor_events ADD COLUMN IF NOT EXISTS screen text',
  'ALTER TABLE visitor_events ADD COLUMN IF NOT EXISTS webdriver boolean',
  'ALTER TABLE visitor_events ADD COLUMN IF NOT EXISTS active_seconds integer',
  'ALTER TABLE visitor_events ADD COLUMN IF NOT EXISTS scroll_pct integer',
  'ALTER TABLE visitor_events ADD COLUMN IF NOT EXISTS interactions integer',
];

/** 42P01: a table doesn't exist yet; 42703: a column doesn't (the source columns, the first time). */
const isMissingSchema = (error: unknown) => ['42P01', '42703'].includes(String((error as { code?: string }).code));

/** Runs `save`, and if a table or column is missing, creates them and runs it again. */
export async function withSchema<T>(sql: Sql, save: () => Promise<T>): Promise<T> {
  try {
    return await save();
  } catch (error) {
    if (!isMissingSchema(error)) throw error;
    for (const statement of visitorSchema) {
      // Another request may create them at the same moment; the retry below tells.
      await sql.query(statement).catch(() => {});
    }
    return save();
  }
}

/**
 * Saves the visit and reads the session it belongs to, in one statement whose
 * snapshot cannot see the row it inserts.
 */
export async function recordVisit(sql: Sql, visit: Visit): Promise<VisitState> {
  const id = visit.sessionId;
  const save = () => sql`
    WITH prior AS (
      SELECT count(*)::int AS pages, min(created_at) AS started,
        coalesce(bool_or(path = ${visit.path}), false) AS seen
      FROM visitor_events WHERE session_id = ${id}
    ),
    landing AS (
      SELECT path, locale, referrer, country, city, source, medium, campaign, device, os, browser, tz, screen, webdriver FROM visitor_events
      WHERE session_id = ${id} ORDER BY created_at LIMIT 1
    ),
    alert AS (SELECT message_id::text AS message_id FROM visitor_alerts WHERE session_id = ${id}),
    burst AS (
      SELECT count(DISTINCT session_id)::int AS others FROM visitor_events
      WHERE session_id <> ${id}
        AND path = coalesce((SELECT path FROM landing), ${visit.path})
        AND created_at BETWEEN coalesce((SELECT started FROM prior), now()) - interval '10 seconds'
          AND coalesce((SELECT started FROM prior), now()) + interval '10 seconds'
    ),
    trail AS (
      SELECT json_agg(json_build_object('path', path, 'at', extract(epoch FROM created_at)::float8,
        'active', active_seconds, 'scroll', scroll_pct, 'interactions', interactions) ORDER BY created_at) AS pages
      FROM visitor_events WHERE session_id = ${id}
    ),
    saved AS (
      INSERT INTO visitor_events (session_id, path, locale, referrer, country, city, source, medium, campaign,
        view_id, device, os, browser, tz, screen, webdriver)
      VALUES (${id}, ${visit.path}, ${visit.locale}, ${visit.referrer}, ${visit.country}, ${visit.city},
        ${visit.source ?? null}, ${visit.medium ?? null}, ${visit.campaign ?? null},
        ${visit.viewId ?? null}, ${visit.device ?? null}, ${visit.os ?? null}, ${visit.browser ?? null},
        ${visit.tz ?? null}, ${visit.screen ?? null}, ${visit.webdriver ?? null})
      RETURNING created_at
    )
    SELECT prior.pages, prior.seen,
      coalesce(extract(epoch FROM saved.created_at - prior.started), 0)::int AS seconds,
      landing.path, landing.locale, landing.referrer, landing.country, landing.city,
      landing.source, landing.medium, landing.campaign,
      landing.device, landing.os, landing.browser, landing.tz, landing.screen, landing.webdriver,
      alert.message_id, trail.pages AS trail, extract(epoch FROM saved.created_at)::float8 AS saved_at,
      burst.others AS burst
    FROM saved CROSS JOIN prior CROSS JOIN trail CROSS JOIN burst LEFT JOIN landing ON true LEFT JOIN alert ON true`;

  const rows = await withSchema(sql, save);

  const row = rows[0] ?? {};
  const text = (value: unknown) => (typeof value === 'string' ? value : null);
  const earlier = Number(row.pages) || 0;
  const before = (Array.isArray(row.trail) ? row.trail : []) as RawPage[];
  const start = Number(before[0]?.at) || Number(row.saved_at) || 0;
  const trail = [
    ...pagesFrom(before, start),
    { path: visit.path, at: Number(row.saved_at) ? Math.max(0, Math.round(Number(row.saved_at) - start)) : Number(row.seconds) || 0 },
  ];
  return {
    first: earlier === 0,
    pages: earlier + 1,
    seconds: Number(row.seconds) || 0,
    newPage: row.seen !== true,
    landing:
      earlier === 0 || !text(row.path)
        ? visit
        : {
            ...visit,
            path: text(row.path)!,
            locale: text(row.locale),
            referrer: text(row.referrer),
            country: text(row.country),
            city: text(row.city),
            source: text(row.source),
            medium: text(row.medium) as SourceMedium | null,
            campaign: text(row.campaign),
            device: text(row.device),
            os: text(row.os),
            browser: text(row.browser),
            tz: text(row.tz),
            screen: text(row.screen),
            webdriver: typeof row.webdriver === 'boolean' ? row.webdriver : null,
          },
    messageId: Number(row.message_id) || null,
    trail,
    burst: Number(row.burst) || 0,
  };
}

type RawPage = { path?: unknown; at?: unknown; active?: unknown; scroll?: unknown; interactions?: unknown };
const optionalNumber = (value: unknown) => (value == null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value));

/** Trail rows from json_agg, with `at` in seconds since `start`. */
function pagesFrom(raw: RawPage[], start: number): PageFacts[] {
  return raw.map((p) => {
    const page: PageFacts = { path: String(p.path ?? ''), at: Math.max(0, Math.round(Number(p.at) - start)) || 0 };
    const active = optionalNumber(p.active);
    const scroll = optionalNumber(p.scroll);
    const interactions = optionalNumber(p.interactions);
    if (active != null) page.active = active;
    if (scroll != null) page.scroll = scroll;
    if (interactions != null) page.interactions = interactions;
    return page;
  });
}

/** What visit-insights reads, from a session's landing visit and its pages. */
export function visitFacts(landing: Visit, trail: PageFacts[], automated: string | null = null): VisitFacts {
  return {
    city: landing.city,
    country: landing.country,
    source: landing.source,
    medium: landing.medium,
    campaign: landing.campaign,
    referrer: landing.referrer,
    device: landing.device,
    os: landing.os,
    browser: landing.browser,
    tz: landing.tz,
    screen: landing.screen,
    webdriver: landing.webdriver,
    pages: trail,
    automated,
  };
}

export interface Engagement {
  sessionId: string;
  viewId: string;
  /** Seconds the page was visible, deepest scroll (0–100) and seconds with input. */
  active: number;
  scroll: number;
  interactions: number;
}

/**
 * Adds a page's engagement when the visitor leaves it or hides the tab. Sent
 * again on each hide with the running totals, so the larger value is kept.
 * Returns false when no page view matched.
 */
export async function recordEngagement(sql: Sql, e: Engagement): Promise<boolean> {
  const rows = await withSchema(
    sql,
    () => sql`UPDATE visitor_events SET
        active_seconds = greatest(coalesce(active_seconds, 0), ${e.active}),
        scroll_pct = greatest(coalesce(scroll_pct, 0), ${e.scroll}),
        interactions = greatest(coalesce(interactions, 0), ${e.interactions})
      WHERE session_id = ${e.sessionId} AND view_id = ${e.viewId}
        AND created_at >= now() - interval '1 day'
      RETURNING session_id`,
  );
  return rows.length > 0;
}

/** A session as the alert shows it: its landing visit, pages, last page and alert. */
export interface SessionSnapshot {
  landing: Visit;
  last: string;
  trail: PageFacts[];
  seconds: number;
  messageId: number | null;
}

export async function loadSession(sql: Sql, sessionId: string): Promise<SessionSnapshot | null> {
  const rows = await sql`
    SELECT e.path, e.locale, e.referrer, e.country, e.city, e.source, e.medium, e.campaign,
      e.device, e.os, e.browser, e.tz, e.screen, e.webdriver,
      (SELECT message_id::text FROM visitor_alerts a WHERE a.session_id = ${sessionId}) AS message_id,
      (SELECT json_agg(json_build_object('path', v.path, 'at', extract(epoch FROM v.created_at)::float8,
        'active', v.active_seconds, 'scroll', v.scroll_pct, 'interactions', v.interactions) ORDER BY v.created_at)
        FROM visitor_events v WHERE v.session_id = ${sessionId}) AS trail
    FROM visitor_events e WHERE e.session_id = ${sessionId} ORDER BY e.created_at LIMIT 1`;
  const row = rows[0];
  if (!row) return null;
  const text = (value: unknown) => (typeof value === 'string' ? value : null);
  const raw = (typeof row.trail === 'string' ? JSON.parse(row.trail) : row.trail) as RawPage[] | null;
  const list = Array.isArray(raw) ? raw : [];
  const trail = pagesFrom(list, Number(list[0]?.at) || 0);
  const landing: Visit = {
    sessionId,
    path: String(row.path),
    locale: text(row.locale),
    referrer: text(row.referrer),
    country: text(row.country),
    city: text(row.city),
    source: text(row.source),
    medium: text(row.medium) as SourceMedium | null,
    campaign: text(row.campaign),
    device: text(row.device),
    os: text(row.os),
    browser: text(row.browser),
    tz: text(row.tz),
    screen: text(row.screen),
    webdriver: typeof row.webdriver === 'boolean' ? row.webdriver : null,
  };
  return {
    landing,
    last: trail.at(-1)?.path ?? landing.path,
    trail,
    seconds: trail.at(-1)?.at ?? 0,
    messageId: Number(row.message_id) || null,
  };
}

/**
 * Re-reads the session after new engagement arrives and rewrites its alert
 * with the updated verdict (an edit rings no notification). Telegram refuses
 * an edit that changes nothing; that's expected and ignored.
 */
export async function refreshAlert(sql: Sql, sessionId: string): Promise<void> {
  const session = await loadSession(sql, sessionId);
  if (!session?.messageId) return;
  const last: Visit = { ...session.landing, path: session.last };
  const text =
    session.trail.length > 1
      ? visitUpdateMessage(last, {
          first: false,
          pages: session.trail.length,
          seconds: session.seconds,
          newPage: false,
          landing: session.landing,
          messageId: session.messageId,
          trail: session.trail,
          burst: 0,
        })
      : newVisitorMessage(session.landing, session.trail);
  await editTelegramMessage(session.messageId, text).then(
    () => console.info('[track-engagement] alert updated'),
    (error) => {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('not modified')) console.error('[track-engagement] alert update failed', message);
    },
  );
}

/** Saves a click on the WhatsApp button, an email link or a phone link. */
export async function recordAction(sql: Sql, action: { sessionId: string; kind: string; path: string | null }): Promise<void> {
  await withSchema(sql, () => sql`INSERT INTO visitor_actions (session_id, kind, path) VALUES (${action.sessionId}, ${action.kind}, ${action.path})`);
}

/** Remembers the Telegram alert of a session. */
async function saveAlert(sql: Sql, sessionId: string, messageId: number): Promise<void> {
  await sql`INSERT INTO visitor_alerts (session_id, message_id) VALUES (${sessionId}, ${messageId})
    ON CONFLICT (session_id) DO NOTHING`;
}

/** Deletes page views and contact clicks older than 13 months, and Telegram alert references older than 30 days. */
export async function removeOldVisits(sql: Sql): Promise<void> {
  await sql`DELETE FROM visitor_events WHERE created_at < now() - interval '13 months'`;
  await sql`DELETE FROM visitor_actions WHERE created_at < now() - interval '13 months'`;
  await sql`DELETE FROM visitor_alerts WHERE created_at < now() - interval '30 days'`;
}

/** Pages whose first opening in a visit sends a separate 🔥 alert, keyed by the path without its locale. */
export const REQUEST_PAGES: Record<string, string> = {
  contact: 'اتصل بنا',
  lp: 'طلب عرض السعر',
};

/** "/contact/" → "contact". */
export function pageKey(path: string): string {
  return path
    .replace(/\/+$/, '')
    .replace(/^\//, '');
}

/** A path shown left to right inside Arabic text, so "/ar" never reads "ar/". */
const shownPath = (path: string) => `‎${escapeHtml(path)}`;

const place = (visit: Visit) =>
  [visit.city, visit.country].filter((v): v is string => Boolean(v)).map(escapeHtml).join(', ') || 'غير معروف';

/**
 * Small towns whose visits are mostly data centers (Meta, Amazon, Google,
 * Microsoft), as "city|country" in lower case without accents. Link
 * previews and safety checks, Meta's especially, open a shared page in a
 * normal-looking browser from these places, so the user agent doesn't give
 * them away (2026-09-29: three "visitors" from Clonee, Fort Worth and
 * Boardman opened the day's product page in the same second). Real cities
 * with a data center too (Fort Worth, Henrico, Council Bluffs) are left out,
 * since their visits are hidden: a burst catches those checks instead.
 */
const DATA_CENTER_TOWNS = new Set([
  'clonee|ie', 'odense|dk', 'lulea|se', 'prineville|us', 'forest city|us', 'altoona|us', 'los lunas|us',
  'papillion|us', 'new albany|us', 'sandston|us', 'eagle mountain|us', 'ashburn|us', 'boardman|us',
  'umatilla|us', 'the dalles|us', 'moncks corner|us', 'lenoir|us', 'pryor|us', 'boydton|us',
  'saint-ghislain|be', 'st. ghislain|be', 'hamina|fi', 'eemshaven|nl',
]);

const plainCity = (city: string) => city.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

/** A small town dominated by data centers (see DATA_CENTER_TOWNS). */
export function isDataCenterTown(city: string | null | undefined, country: string | null | undefined): boolean {
  return Boolean(city && country && DATA_CENTER_TOWNS.has(`${plainCity(city)}|${country.toLowerCase()}`));
}

/** Why a visit looks automated, or null: a browser driven by software, a data-center town, or several sessions opening the same page at once. */
export function botReason(visit: Visit, burst: number): string | null {
  if (visit.webdriver === true) return 'automated browser';
  if (isDataCenterTown(visit.city, visit.country)) return 'data-center town';
  return burst > 0 ? 'same-page burst' : null;
}

/** Other sessions that opened `path` within 10 seconds of this session's first page. */
export async function burstFor(sql: Sql, sessionId: string, path: string): Promise<number> {
  const rows = await sql`
    WITH started AS (SELECT min(created_at) AS at FROM visitor_events WHERE session_id = ${sessionId})
    SELECT count(DISTINCT session_id)::int AS others FROM visitor_events, started
    WHERE session_id <> ${sessionId} AND path = ${path}
      AND created_at BETWEEN coalesce(started.at, now()) - interval '10 seconds'
        AND coalesce(started.at, now()) + interval '10 seconds'`;
  return Number(rows[0]?.others) || 0;
}

/** How long a new session's alert waits, so the rest of a burst has arrived and is counted. */
const SETTLE_MS = 8000;

/** Visit length in Arabic, in whole minutes. */
export function visitLength(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return 'أقل من دقيقة';
  if (minutes === 1) return 'دقيقة';
  if (minutes === 2) return 'دقيقتان';
  if (minutes <= 10) return `${minutes} دقائق`;
  if (minutes < 60) return `${minutes} دقيقة`;
  return 'أكثر من ساعة';
}

/** Time spent on one page, short: "45 ث", "3 د". */
export function pageTime(seconds: number): string {
  return seconds < 60 ? `${seconds} ث` : `${Math.floor(seconds / 60)} د`;
}

/** Pages listed in the edited alert; a longer visit keeps its first page and its latest ones. */
const TRAIL_MAX = 25;

/** "1. / · 40 ث" per page in order; the last page has no time yet (the visitor is on it, or left from it). */
export function trailLines(trail: VisitState['trail']): string[] {
  const lines = trail.map((page, i) => {
    const shown = shownPath(page.path.length > 80 ? `${page.path.slice(0, 79)}…` : page.path);
    const next = trail[i + 1];
    return next ? `${i + 1}. ${shown} · ${pageTime(Math.max(0, next.at - page.at))}` : `${i + 1}. ${shown}`;
  });
  if (lines.length <= TRAIL_MAX) return lines;
  const hidden = lines.length - TRAIL_MAX;
  return [lines[0], `… ${hidden} صفحات أخرى`, ...lines.slice(-(TRAIL_MAX - 1))];
}

/** "إعلان فيسبوك · حملة: …" when the source is known, else the raw referrer. */
function sourceLine(visit: Visit): string {
  if (visit.source && visit.medium && visit.medium !== 'direct') {
    const campaign = visit.campaign ? ` · حملة: ${escapeHtml(visit.campaign)}` : '';
    return `↩️ المصدر: ${escapeHtml(sourceLabel({ source: visit.source, medium: visit.medium }))}${campaign}`;
  }
  return visit.referrer ? `↩️ المصدر: ${escapeHtml(visit.referrer)}` : '↩️ المصدر: مباشر';
}

const aboutLines = (visit: Visit): string[] => {
  const device = deviceLabel(visit);
  return [
    `📍 من: ${place(visit)}`,
    visit.locale ? `🌐 اللغة: ${escapeHtml(visit.locale)}` : '',
    sourceLine(visit),
    device ? `🖥️ الجهاز: ${escapeHtml(device)}` : '',
  ].filter(Boolean);
};

/** "🧠 التقييم: …" for the alert, from what is known about the visit so far. */
const assessment = (landing: Visit, trail: PageFacts[]) => verdictLine(classifyVisit(visitFacts(landing, trail)));

/** The Telegram alert for a new visitor (parse_mode HTML, every value escaped). */
export function newVisitorMessage(visit: Visit, trail: PageFacts[] = [{ path: visit.path, at: 0 }]): string {
  const [from, ...rest] = aboutLines(visit);
  return ['🆕 <b>زائر جديد دخل الموقع</b>', from, `📄 الصفحة: ${shownPath(visit.path)}`, ...rest, assessment(visit, trail)].join('\n');
}

/**
 * The same alert once the visitor has moved on: every page in order with the
 * time spent on it, and the last page, which is where the visit ended once no
 * new page arrives.
 */
export function visitUpdateMessage(visit: Visit, state: VisitState): string {
  const trail = state.trail.length ? state.trail : [{ path: visit.path, at: state.seconds }];
  return [
    '🆕 <b>زائر جديد دخل الموقع</b>',
    ...aboutLines(state.landing),
    '',
    '🧭 <b>مسار الزيارة:</b>',
    ...trailLines(trail),
    '',
    `👣 آخر صفحة: ${shownPath(visit.path)}`,
    `🔢 عدد الصفحات: ${state.pages} · مدة الزيارة: ${visitLength(state.seconds)}`,
    assessment(state.landing, trail),
  ].join('\n');
}

/** The separate alert when a visitor first opens a request page in this visit, or null. */
export function requestPageMessage(visit: Visit, state: VisitState): string | null {
  const page = REQUEST_PAGES[pageKey(visit.path)];
  if (!page || !state.newPage) return null;
  return [`🔥 الزائر فتح صفحة ${page}`, `📍 ${place(visit)} · 📄 ${shownPath(visit.path)}`].join('\n');
}

/**
 * Tells the team on Telegram, after the response: a new session sends the
 * alert (and remembers it), a later page silently edits that alert, and the
 * first opening of a request page sends a separate message replying to it.
 * A visit that looks automated (botReason) gets no message at all (owner's
 * choice, 2026-09-29); it's still saved. A new session waits `settleMs`
 * first, so the first visit of a burst is recognised too.
 */
export async function notifyTeam(sql: Sql, visit: Visit, state: VisitState, opts: { settleMs?: number } = {}): Promise<void> {
  let messageId = state.messageId;
  let burst = state.burst;
  if (state.first) {
    await new Promise((resolve) => setTimeout(resolve, opts.settleMs ?? SETTLE_MS));
    burst = await burstFor(sql, visit.sessionId, visit.path);
  }
  const reason = botReason(state.landing, burst);
  if (reason) {
    console.info('[track-visit] no alert, likely automated:', reason, state.landing.city, state.landing.country);
    return;
  }
  if (state.first) {
    messageId = (await sendTelegramMessage(newVisitorMessage(visit))) ?? null;
    if (messageId) await saveAlert(sql, visit.sessionId, messageId);
  } else if (messageId) {
    // An alert deleted in Telegram cannot be edited; that must not stop the 🔥 alert.
    await editTelegramMessage(messageId, visitUpdateMessage(visit, state)).catch((error) =>
      console.error('[track-visit] alert update failed', error instanceof Error ? error.message : error),
    );
  }
  const request = requestPageMessage(visit, state);
  if (request) await sendTelegramMessage(request, messageId);
}
