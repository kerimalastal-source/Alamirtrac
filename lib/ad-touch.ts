// Browser side of src/lib/attribution.ts: notes where the visitor came from
// (UTM tags, an ad click id, another site) and keeps it for the forms.
//
// - The session's own arrival goes to sessionStorage (cleared with the tab),
//   and is sent with the session's first page view.
// - The latest arrival from an ad or another site goes to localStorage for 30
//   days, so a visitor who clicks an ad today and sends a request tomorrow is
//   still credited to that ad. Only these raw facts are kept: no identifier.
// Storage can be blocked (private mode, settings): every access is guarded.
import type { AdTouch } from './attribution';

const SESSION_KEY = 'alamir_visitor_session';
const SESSION_TOUCH_KEY = 'alamir_session_touch';
const LAST_TOUCH_KEY = 'alamir_ad_touch';

function read(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(storage: Storage | undefined, key: string, value: string) {
  try {
    storage?.setItem(key, value);
  } catch {
    // Storage blocked: attribution is a nice-to-have.
  }
}

const session = (): Storage | undefined => (typeof sessionStorage === 'undefined' ? undefined : sessionStorage);
const local = (): Storage | undefined => (typeof localStorage === 'undefined' ? undefined : localStorage);

/** The tab's anonymous visit id, created on first use (the same one the page-view beacon sends). */
export function visitorSessionId(): { id: string; isNew: boolean } {
  const existing = read(session(), SESSION_KEY);
  if (existing) return { id: existing, isNew: false };
  const id = crypto.randomUUID();
  write(session(), SESSION_KEY, id);
  return { id, isNew: true };
}

/** What this page's URL and referrer say about where the visitor came from. */
function touchFromPage(): AdTouch {
  const params = new URLSearchParams(window.location.search);
  const touch: AdTouch = { landing: window.location.pathname };
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const) {
    const value = params.get(key);
    if (value) touch[key] = value.slice(0, 120);
  }
  if (params.has('gclid') || params.has('gbraid') || params.has('wbraid')) touch.gclid = true;
  if (params.has('fbclid')) touch.fbclid = true;
  if (params.has('msclkid')) touch.msclkid = true;
  try {
    const ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.hostname !== window.location.hostname) touch.referrer = document.referrer.slice(0, 500);
  } catch {
    // An unparsable referrer is just ignored.
  }
  return touch;
}

const isExternal = (t: AdTouch) =>
  Boolean(t.utm_source || t.utm_medium || t.utm_campaign || t.gclid || t.fbclid || t.msclkid || t.referrer);

/**
 * Records this page's arrival. Returns the touch to send with the page view:
 * only on a session's first page, since the server reads a session's source
 * from its first event.
 */
export function recordArrival(isNewSession: boolean): AdTouch | null {
  const touch = touchFromPage();
  if (isExternal(touch)) write(local(), LAST_TOUCH_KEY, JSON.stringify({ ...touch, at: Date.now() }));
  if (!isNewSession) return null;
  write(session(), SESSION_TOUCH_KEY, JSON.stringify(touch));
  return touch;
}
