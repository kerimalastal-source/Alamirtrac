"use client";

// Anonymous page-view beacon, mounted once in app/layout.tsx. The site is
// navigated client-side, so every pathname change is its own page view (the
// hadarahospitality version runs once per full page load).
//
// A session's first page also carries where the visitor came from (an ad, a
// search engine, another site: lib/ad-touch.ts), and clicks on WhatsApp, phone,
// email and social links are counted (the forms report their own submission).
// To tell people from automated visits, each page view sends the time zone, the
// screen size and navigator.webdriver, and when the page is hidden or left, how
// it was used: seconds visible, deepest scroll and seconds with input
// (lib/visit-insights.ts). Nothing personal is sent.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordArrival, visitorSessionId } from "@/lib/ad-touch";
import { actionFromHref, beacon, trackAction } from "@/lib/track-action";

const post = (url: string, body: string) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {
    // Tracking must never affect the visitor's experience of the page.
  });

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const { id: sessionId, isNew } = visitorSessionId();
    const touch = recordArrival(isNew);
    const viewId =
      crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    let tz: string | null = null;
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    } catch {
      // An old browser without time zone support.
    }

    void post(
      "/api/visit",
      JSON.stringify({
        sessionId,
        path: pathname,
        locale: document.documentElement.lang || null,
        referrer: document.referrer || null,
        touch,
        viewId,
        tz,
        screen: `${window.screen.width}x${window.screen.height}`,
        webdriver: navigator.webdriver === true,
      }),
    );

    // Contact clicks: WhatsApp, phone, email, Facebook, Instagram.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      const kind = link ? actionFromHref(link.getAttribute("href") ?? "") : null;
      if (kind) trackAction(kind);
    };
    document.addEventListener("click", onClick, { capture: true });

    // Engagement: visible seconds, deepest scroll, seconds with input.
    let visibleMs = 0;
    let visibleSince: number | null = document.visibilityState === "visible" ? performance.now() : null;
    let maxScroll = 0;
    const inputSeconds = new Set<number>();
    let lastSent = "";

    const measureScroll = () => {
      const height = document.documentElement.scrollHeight;
      if (height > 0) {
        maxScroll = Math.max(maxScroll, Math.min(100, Math.round(((window.scrollY + window.innerHeight) / height) * 100)));
      }
    };
    const markInput = () => {
      if (inputSeconds.size < 100000) inputSeconds.add(Math.floor(performance.now() / 1000));
    };
    measureScroll();
    window.addEventListener("scroll", measureScroll, { passive: true });
    const inputEvents = ["pointerdown", "keydown", "touchstart", "wheel", "mousemove"];
    for (const type of inputEvents) window.addEventListener(type, markInput, { passive: true, capture: true });

    // Sent when the page is hidden or left, and also after 15 and 45 seconds:
    // some phones close a tab without a hide event. Each send carries the running totals.
    const sendEngagement = (leaving: boolean) => {
      const now = performance.now();
      const active = visibleMs + (visibleSince != null ? now - visibleSince : 0);
      if (leaving && visibleSince != null) {
        visibleMs = active;
        visibleSince = null;
      }
      const body = JSON.stringify({
        sessionId,
        viewId,
        active: Math.round(active / 1000),
        scroll: maxScroll,
        interactions: inputSeconds.size,
      });
      if (body === lastSent) return;
      lastSent = body;
      if (leaving) beacon("/api/visit/engagement", body);
      else void post("/api/visit/engagement", body);
    };
    const timers = [15000, 45000].map((delay) =>
      window.setTimeout(() => {
        if (document.visibilityState === "visible") sendEngagement(false);
      }, delay),
    );
    const onVisibility = () => {
      if (document.visibilityState === "hidden") sendEngagement(true);
      else visibleSince = performance.now();
    };
    const onPageHide = () => sendEngagement(true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    // Leaving this page view: client-side navigation or unmount.
    return () => {
      sendEngagement(true);
      timers.forEach((timer) => window.clearTimeout(timer));
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("scroll", measureScroll);
      for (const type of inputEvents) window.removeEventListener(type, markInput, { capture: true });
    };
  }, [pathname]);

  return null;
}
