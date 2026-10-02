// Reading a visit: is it a real person? Used by the live Telegram alert
// (lib/visits.ts). Plain functions over what the anonymous tracking saves
// (pages, times, device, engagement). Nothing here identifies a person.
// Ported from hadarahospitality's lib/visit-insights.ts.

// ── Device, system and browser from the user agent ─────────────────────────
// Only these three labels are stored, never the user agent itself.

export type DeviceKind = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  device: DeviceKind;
  os: string | null;
  browser: string | null;
}

export function parseUserAgent(ua: string | null | undefined): DeviceInfo {
  const s = ua ?? '';
  const device: DeviceKind = /iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(s)
    ? 'tablet'
    : /Mobi|iPhone|iPod|Android|Windows Phone/i.test(s)
      ? 'mobile'
      : 'desktop';
  const os = /iPhone|iPad|iPod/.test(s)
    ? 'iOS'
    : /Android/.test(s)
      ? 'Android'
      : /Windows/.test(s)
        ? 'Windows'
        : /CrOS/.test(s)
          ? 'ChromeOS'
          : /Mac OS X|Macintosh/.test(s)
            ? 'macOS'
            : /Linux/.test(s)
              ? 'Linux'
              : null;
  const browser = /Instagram/.test(s)
    ? 'Instagram'
    : /FBAN|FBAV|FB_IAB|FBIOS/.test(s)
      ? 'Facebook'
      : /LinkedInApp/.test(s)
        ? 'LinkedIn'
        : /musical_ly|BytedanceWebview|TikTok/i.test(s)
          ? 'TikTok'
          : /Snapchat/.test(s)
            ? 'Snapchat'
            : /Edg(e|A|iOS)?\//.test(s)
              ? 'Edge'
              : /OPR\/|Opera/.test(s)
                ? 'Opera'
                : /SamsungBrowser/.test(s)
                  ? 'Samsung Internet'
                  : /YaBrowser/.test(s)
                    ? 'Yandex'
                    : /Firefox|FxiOS/.test(s)
                      ? 'Firefox'
                      : /Chrome|CriOS|Chromium/.test(s)
                        ? 'Chrome'
                        : /Safari/.test(s)
                          ? 'Safari'
                          : null;
  return { device, os, browser };
}

const DEVICE_AR: Record<DeviceKind, string> = { mobile: '📱 جوال', tablet: '📱 جهاز لوحي', desktop: '💻 حاسوب' };

const OS_AR: Record<string, string> = {
  iOS: 'آي أو إس', Android: 'أندرويد', Windows: 'ويندوز', macOS: 'ماك', Linux: 'لينكس', ChromeOS: 'كروم أو إس',
};
const BROWSER_AR: Record<string, string> = {
  Chrome: 'كروم', Safari: 'سفاري', Firefox: 'فايرفوكس', Edge: 'إيدج', Opera: 'أوبرا', 'Samsung Internet': 'متصفح سامسونج',
  Yandex: 'ياندكس', Instagram: 'إنستغرام', Facebook: 'فيسبوك', LinkedIn: 'لينكدإن', TikTok: 'تيك توك', Snapchat: 'سناب شات',
};

export const osLabel = (os: string | null | undefined) => (os ? (OS_AR[os] ?? os) : null);
export const browserLabel = (browser: string | null | undefined) => (browser ? (BROWSER_AR[browser] ?? browser) : null);

/** "📱 جوال · أندرويد · كروم", or null when nothing is known. */
export function deviceLabel(f: { device?: string | null; os?: string | null; browser?: string | null }): string | null {
  if (!f.device && !f.os && !f.browser) return null;
  return [f.device && DEVICE_AR[f.device as DeviceKind], osLabel(f.os), browserLabel(f.browser)].filter(Boolean).join(' · ');
}

// ── Time zone against country ──────────────────────────────────────────────
// The browser's time zone (e.g. "America/New_York") should sit in the same
// part of the world as the country Vercel reads from the IP address. A
// mismatch hints at a VPN or a server, so it only counts as a mild signal.

const AMERICAS =
  'US CA MX GT BZ SV HN NI CR PA CU JM HT DO PR BS BB TT AG DM GD KN LC VC CO VE GY SR GF EC PE BR BO PY CL AR UY AW CW BQ SX MF BL GP MQ KY VG VI TC BM AI MS PM GL';
const AFRICA =
  'DZ AO BJ BW BF BI CM CV CF TD KM CG CD CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW EH RE YT';
const EUROPE =
  'AL AD AT BY BE BA BG HR CZ DK EE FI FR DE GI GR HU IS IE IT XK LV LI LT LU MT MD MC ME NL MK NO PL PT RO SM RS SK SI ES SE CH UA GB VA GG JE IM FO AX';
const OCEANIA = 'AU NZ FJ PG SB VU NC PF WS TO KI TV NR FM MH PW GU MP AS CK NU';
/** Countries spanning two parts of the world. */
const BOTH: Record<string, string[]> = {
  TR: ['Europe', 'Asia'], RU: ['Europe', 'Asia'], KZ: ['Asia', 'Europe'], GE: ['Asia', 'Europe'],
  AZ: ['Asia', 'Europe'], AM: ['Asia', 'Europe'], CY: ['Asia', 'Europe'], US: ['America', 'Pacific'],
  ES: ['Europe', 'Africa', 'Atlantic'], PT: ['Europe', 'Atlantic'], GB: ['Europe', 'Atlantic'],
};

const AREAS = new Map<string, string[]>();
for (const [list, area] of [[AMERICAS, ['America']], [AFRICA, ['Africa', 'Indian']], [EUROPE, ['Europe', 'Atlantic']], [OCEANIA, ['Australia', 'Pacific']]] as const) {
  for (const code of list.split(' ')) AREAS.set(code, [...area]);
}

const JUDGED_AREAS = new Set(['Africa', 'America', 'Asia', 'Europe', 'Australia', 'Pacific']);

/** The time zone is in another part of the world than the country, or null when it can't be judged. */
export function timeZoneMismatch(tz: string | null | undefined, country: string | null | undefined): boolean | null {
  if (!tz || !country) return null;
  const area = tz.split('/')[0];
  if (!JUDGED_AREAS.has(area)) return null;
  const code = country.toUpperCase();
  const allowed = BOTH[code] ?? AREAS.get(code) ?? ['Asia'];
  return !allowed.includes(area);
}

/** UTC as the browser's own zone: a server default; few people set it. */
const isUtcZone = (tz: string | null | undefined) => Boolean(tz && /^(Etc\/)?(UTC|GMT|Universal|Zulu)$/i.test(tz));

// ── Is it a person? ────────────────────────────────────────────────────────

export interface PageFacts {
  path: string;
  /** Seconds since the visit's first page. */
  at: number;
  /** Seconds the page was visible, its deepest scroll (%) and seconds with input, once reported. */
  active?: number | null;
  scroll?: number | null;
  interactions?: number | null;
}

export interface VisitFacts {
  city?: string | null;
  country?: string | null;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  referrer?: string | null;
  device?: string | null;
  os?: string | null;
  browser?: string | null;
  tz?: string | null;
  screen?: string | null;
  webdriver?: boolean | null;
  pages: PageFacts[];
  /** Contact clicks in the visit: whatsapp, email, phone. */
  actions?: string[];
  /** The visit looks like a data-center check or a burst (src/lib/visits.ts botReason). */
  automated?: string | null;
}

export type Verdict = 'real' | 'unsure' | 'bot' | 'pending';

export interface VerdictResult {
  verdict: Verdict;
  /** Short Arabic reasons, strongest first. */
  reasons: string[];
}

const sum = (pages: PageFacts[], key: 'active' | 'interactions') => pages.reduce((n, p) => n + (Number(p[key]) || 0), 0);
const maxScroll = (pages: PageFacts[]) => pages.reduce((n, p) => Math.max(n, Number(p.scroll) || 0), 0);
const reported = (pages: PageFacts[]) => pages.some((p) => p.active != null || p.interactions != null || p.scroll != null);

/** Weighs the signals: automation, a server-like setup or robotic timing, against input, reading time and scrolling. */
export function classifyVisit(f: VisitFacts): VerdictResult {
  const pages = f.pages;
  const bot: [number, string][] = [];
  const human: [number, string][] = [];

  if (f.actions?.length) human.push([6, 'نقر على وسيلة تواصل']);

  if (f.webdriver || f.automated === 'automated browser') bot.push([5, 'متصفح مُدار آلياً']);
  else if (f.automated) bot.push([5, f.automated === 'data-center town' ? 'من مدينة مراكز بيانات' : 'ضمن دفعة زيارات متزامنة']);
  if (f.screen === '800x600') bot.push([1.5, 'شاشة بمقاس افتراضي للخوادم']);
  if (isUtcZone(f.tz)) bot.push([1.5, 'منطقة زمنية UTC']);
  else if (timeZoneMismatch(f.tz, f.country)) bot.push([1, 'المنطقة الزمنية لا تطابق البلد']);
  if (f.device === 'desktop' && f.os === 'Linux') bot.push([0.5, 'حاسوب Linux']);

  const gaps = pages.slice(1).map((p, i) => p.at - pages[i].at);
  if (gaps.length >= 2 && gaps.every((g) => g < 2)) bot.push([3, 'تنقّل سريع جداً بين الصفحات']);

  const interactions = sum(pages, 'interactions');
  const active = sum(pages, 'active');
  const scroll = maxScroll(pages);
  const hasEngagement = reported(pages);
  if (interactions >= 3) human.push([2.5, 'تفاعل باللمس أو الفأرة']);
  else if (interactions >= 1) human.push([1.5, 'تفاعل محدود']);
  if (scroll >= 50) human.push([1, `مرّر حتى ${Math.round(scroll)}%`]);
  if (active >= 20) human.push([1, 'قضى وقتاً في القراءة']);
  if (gaps.some((g) => g >= 5 && g <= 1800)) human.push([1, 'تنقّل طبيعي بين الصفحات']);
  if (f.medium && ['organic', 'paid', 'social', 'ai', 'email'].includes(f.medium)) human.push([0.5, 'جاء من بحث أو منصة']);
  if (hasEngagement && interactions === 0 && active < 5 && pages.length === 1) bot.push([1, 'لا تفاعل ومغادرة فورية']);

  const b = bot.reduce((n, [w]) => n + w, 0);
  const h = human.reduce((n, [w]) => n + w, 0);
  const byWeight = (list: [number, string][]) => list.sort((x, y) => y[0] - x[0]).map(([, r]) => r);

  let verdict: Verdict;
  if (f.actions?.length) verdict = 'real';
  else if (b >= 3 && h < 3) verdict = 'bot';
  else if (h >= 2.5 && b <= 1.5) verdict = 'real';
  else if (!hasEngagement && b < 1.5 && pages.length === 1) verdict = 'pending';
  else verdict = 'unsure';

  const reasons = verdict === 'bot' ? byWeight(bot) : verdict === 'real' ? byWeight(human) : [...byWeight(bot), ...byWeight(human)];
  return { verdict, reasons: reasons.slice(0, 3) };
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  real: '🟢 حقيقي على الأرجح',
  unsure: '🟡 غير مؤكد',
  bot: '🔴 آلي على الأرجح',
  pending: '⏳ جارٍ التقييم…',
};

/** The alert line: "🧠 التقييم: 🟢 حقيقي على الأرجح (تفاعل…، …)". */
export function verdictLine(result: VerdictResult): string {
  const why = result.verdict === 'pending' || !result.reasons.length ? '' : ` (${result.reasons.join('، ')})`;
  return `🧠 التقييم: ${VERDICT_LABEL[result.verdict]}${why}`;
}
