// Where a visitor came from: an ad (UTM tags or an ad click id), a search
// engine, a social network, another site, or nowhere (direct). Shared by the
// visitor beacon, the quote form and the contact form, so the statistics page
// can say which ad brought which visits and which requests. Pure functions, no
// imports.
//
// The browser sends the raw facts (src/scripts/ad-touch.ts); the server
// classifies them here, so the rules live in one place.

/** What the browser saw on the page a visitor arrived on. */
export interface AdTouch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  /** An ad click id was in the URL (Google gclid, Meta fbclid, Microsoft msclkid). */
  gclid?: boolean;
  fbclid?: boolean;
  msclkid?: boolean;
  /** document.referrer, only when it's another site. */
  referrer?: string;
  /** The path the visitor arrived on. */
  landing?: string;
}

export type SourceMedium = 'paid' | 'organic' | 'social' | 'referral' | 'direct' | 'ai' | 'email';

export interface Source {
  /** "facebook", "instagram", "google", a site's host name, or "direct". */
  source: string;
  medium: SourceMedium;
  campaign: string | null;
  /** utm_content: usually the ad's own name. */
  content: string | null;
}

const MAX = 120;
const clean = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, MAX);
  return trimmed || undefined;
};

/** Reads an AdTouch from untrusted JSON (a form field or the beacon body). */
export function parseAdTouch(raw: unknown): AdTouch | null {
  let value = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  const touch: AdTouch = {
    utm_source: clean(v.utm_source),
    utm_medium: clean(v.utm_medium),
    utm_campaign: clean(v.utm_campaign),
    utm_content: clean(v.utm_content),
    utm_term: clean(v.utm_term),
    gclid: v.gclid === true || undefined,
    fbclid: v.fbclid === true || undefined,
    msclkid: v.msclkid === true || undefined,
    referrer: typeof v.referrer === 'string' ? v.referrer.slice(0, 500) : undefined,
    landing: clean(v.landing),
  };
  return touch;
}

/** Common spellings of the same network in utm_source (Meta's {{site_source_name}} gives fb/ig/msg/an). */
const SOURCE_ALIASES: Record<string, string> = {
  fb: 'facebook',
  'facebook.com': 'facebook',
  meta: 'facebook',
  ig: 'instagram',
  'instagram.com': 'instagram',
  msg: 'messenger',
  an: 'audience network',
  'google.com': 'google',
  adwords: 'google',
  'google ads': 'google',
  googleads: 'google',
  tiktok: 'tiktok',
  li: 'linkedin',
  'linkedin.com': 'linkedin',
  x: 'x',
  twitter: 'x',
};

const PAID_MEDIUMS = /^(paid|cpc|ppc|cpm|cpv|ads?|paid[_ -]?(social|search)|display|sponsored|banner|retargeting)$/i;

/**
 * AI assistants. ChatGPT tags the links it cites with utm_source=chatgpt.com
 * and no utm_medium, which isn't an ad (a visit read as "إعلان chatgpt.com"
 * on 2026-09-30); Perplexity and Copilot do the same.
 */
const AI_SOURCES = /(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)$|^(chatgpt|openai|perplexity|claude|gemini|copilot)$/i;

function referrerHost(referrer: string | undefined): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** A referring host, as a source and medium. */
function fromHost(host: string): Pick<Source, 'source' | 'medium'> {
  const is = (re: RegExp) => re.test(host);
  if (is(/(^|\.)google\.[a-z.]+$/)) return { source: 'google', medium: 'organic' };
  if (is(/(^|\.)bing\.com$/)) return { source: 'bing', medium: 'organic' };
  if (is(/(^|\.)yandex\.[a-z.]+$|(^|\.)ya\.ru$/)) return { source: 'yandex', medium: 'organic' };
  if (is(/(^|\.)duckduckgo\.com$/)) return { source: 'duckduckgo', medium: 'organic' };
  if (is(/(^|\.)yahoo\.com$/)) return { source: 'yahoo', medium: 'organic' };
  if (is(/(^|\.)(facebook\.com|fb\.com|fb\.me)$/)) return { source: 'facebook', medium: 'social' };
  if (is(/(^|\.)instagram\.com$/)) return { source: 'instagram', medium: 'social' };
  if (is(/(^|\.)(linkedin\.com|lnkd\.in)$/)) return { source: 'linkedin', medium: 'social' };
  if (is(/(^|\.)(t\.co|twitter\.com|x\.com)$/)) return { source: 'x', medium: 'social' };
  if (is(/(^|\.)(youtube\.com|youtu\.be)$/)) return { source: 'youtube', medium: 'social' };
  if (is(/(^|\.)tiktok\.com$/)) return { source: 'tiktok', medium: 'social' };
  if (is(/(^|\.)(whatsapp\.com|wa\.me)$/)) return { source: 'whatsapp', medium: 'social' };
  if (is(/(^|\.)(t\.me|telegram\.org)$/)) return { source: 'telegram', medium: 'social' };
  if (AI_SOURCES.test(host)) return { source: host, medium: 'ai' };
  if (is(/(^|\.)(mail\.google\.com|outlook\.(live|office)\.com|mail\.yahoo\.com)$/)) return { source: host, medium: 'email' };
  return { source: host, medium: 'referral' };
}

/**
 * Classifies a touch. UTM tags win (they're set on purpose in an ad), then an
 * ad click id, then the referring site. `ownHost` keeps internal navigation
 * from reading as a referral.
 */
export function classifySource(touch: AdTouch | null | undefined, ownHost = 'alamirtrac.com'): Source {
  const t = touch ?? {};
  const campaign = t.utm_campaign ?? null;
  const content = t.utm_content ?? null;
  const host = referrerHost(t.referrer);
  const external = host && !host.endsWith(ownHost.replace(/^www\./, '')) && host !== 'alamirtrac-three.vercel.app' ? host : null;

  if (t.utm_source) {
    const raw = t.utm_source.toLowerCase();
    const source = SOURCE_ALIASES[raw] ?? raw;
    const medium: SourceMedium =
      t.utm_medium && PAID_MEDIUMS.test(t.utm_medium) ? 'paid'
      : t.gclid || t.msclkid ? 'paid'
      : t.utm_medium && /social/i.test(t.utm_medium) ? 'social'
      : t.utm_medium && /e-?mail|newsletter/i.test(t.utm_medium) ? 'email'
      : t.utm_medium && /organic|seo/i.test(t.utm_medium) ? 'organic'
      : t.utm_medium ? 'referral'
      : AI_SOURCES.test(source) ? 'ai'
      : 'paid';
    return { source, medium, campaign, content };
  }
  if (t.gclid) return { source: 'google', medium: 'paid', campaign, content };
  if (t.msclkid) return { source: 'bing', medium: 'paid', campaign, content };
  if (t.fbclid) {
    // Meta adds fbclid to every outbound link, ads and ordinary posts alike,
    // so without UTM tags it only says "Facebook or Instagram".
    return { source: external && /instagram/.test(external) ? 'instagram' : 'facebook', medium: 'social', campaign, content };
  }
  if (external) return { ...fromHost(external), campaign, content };
  return { source: 'direct', medium: 'direct', campaign: null, content: null };
}

const NETWORK_NAMES: Record<string, string> = {
  facebook: 'فيسبوك',
  instagram: 'إنستغرام',
  messenger: 'ماسنجر',
  google: 'جوجل',
  bing: 'بينغ',
  yandex: 'ياندكس',
  linkedin: 'لينكدإن',
  youtube: 'يوتيوب',
  tiktok: 'تيك توك',
  whatsapp: 'واتساب',
  telegram: 'تيليجرام',
  x: 'إكس',
};

/** The source in a few Arabic words, for Telegram and the statistics page: "إعلان فيسبوك". */
export function sourceLabel(s: Pick<Source, 'source' | 'medium'>): string {
  const name = NETWORK_NAMES[s.source] ?? s.source;
  // Visits saved before the AI fix carry medium "paid".
  switch (AI_SOURCES.test(s.source) && s.medium === 'paid' ? 'ai' : s.medium) {
    case 'paid':
      return `إعلان ${name}`;
    case 'organic':
      return `بحث ${name}`;
    case 'social':
      // A post, a profile link, or an ad without UTM tags: Meta doesn't say which.
      return name;
    case 'ai':
      return `مساعد ذكاء اصطناعي (${s.source})`;
    case 'email':
      return 'رابط في بريد إلكتروني';
    case 'direct':
      return 'مباشر';
    default:
      // Sessions from before the source columns (stats page only).
      if ((s.medium as string) === 'unknown') return 'غير مسجّل (قبل 28 سبتمبر 2026)';
      return `موقع آخر (${s.source})`;
  }
}
