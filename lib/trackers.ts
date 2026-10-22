import { flags } from "./flags";

// Meta Pixel and Google Analytics. Nothing here runs until loadTrackers() is called, and that happens only
// after the visitor accepts cookies (components/ConsentBanner.tsx). Events are no-ops when a tool isn't loaded.
export const META_PIXEL_ID = "1408348340968029";
export const GA_MEASUREMENT_ID = "G-8N9W3E758L";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: unknown;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function loadMetaPixel() {
  if (window.fbq) return; // never twice: events would be counted twice
  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  }) as Fbq;
  window.fbq = fbq;
  window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  fbq("init", META_PIXEL_ID);
  fbq("track", "PageView");
}

function loadGoogleAnalytics() {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js reads the arguments object itself from the dataLayer, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);
}

export function loadTrackers() {
  loadMetaPixel();
  // Google Analytics stays off until NEXT_PUBLIC_GA_LIVE=1 (the owner asked to leave it as it is).
  if (flags.analytics) loadGoogleAnalytics();
}

/** A page change inside the site (the first page view is sent by loadTrackers). Google Analytics sees history changes itself. */
export function trackRoutePageView() {
  window.fbq?.("track", "PageView");
}

/** A tap on WhatsApp or a phone link. */
export function trackContactClick(method: "whatsapp" | "phone") {
  window.fbq?.("track", "Contact", { content_name: method, content_category: window.location.pathname });
  window.gtag?.("event", "contact_click", { method });
}

/** A request the server accepted. Never carries a name, phone number or email. */
export function trackLead(service?: string) {
  const label = service || "general";
  window.fbq?.("track", "Lead", { content_name: label });
  window.gtag?.("event", "generate_lead", { lead_type: label });
}
