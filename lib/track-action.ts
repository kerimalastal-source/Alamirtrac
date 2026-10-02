// Sends a contact click or a form submission to /api/visit/action, with the
// session's anonymous id. sendBeacon survives the page being left (a WhatsApp or
// mailto link often opens another app). Tracking must never affect the page.
import { visitorSessionId } from "./ad-touch";

export type ActionKind = "whatsapp" | "phone" | "email" | "facebook" | "instagram" | "form";

/** Sends `body` to `url`, with sendBeacon when it can and fetch otherwise. */
export function beacon(url: string, body: string) {
  try {
    if (navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }))) return;
  } catch {
    // Fall through to fetch.
  }
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
}

/** The action a link click stands for, from its href, or null for any other link. */
export function actionFromHref(href: string): ActionKind | null {
  if (/^https:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//.test(href)) return "whatsapp";
  if (href.startsWith("mailto:")) return "email";
  if (href.startsWith("tel:")) return "phone";
  if (/^https:\/\/(www\.)?facebook\.com\//.test(href)) return "facebook";
  if (/^https:\/\/(www\.)?instagram\.com\//.test(href)) return "instagram";
  return null;
}

export function trackAction(kind: ActionKind) {
  beacon("/api/visit/action", JSON.stringify({ sessionId: visitorSessionId().id, kind, path: window.location.pathname }));
}
