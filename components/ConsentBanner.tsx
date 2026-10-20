"use client";

// Cookie-consent banner. Meta Pixel and Google Analytics load only after "قبول"; "رفض" loads nothing.
// The choice is kept in localStorage and can be changed from the footer ("إعدادات الكوكيز").
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearTrackingCookies, getConsent, OPEN_SETTINGS_EVENT, setConsent, subscribeConsent } from "@/lib/consent";
import { loadTrackers, trackRoutePageView } from "@/lib/trackers";

export default function ConsentBanner() {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => "unknown" as const);
  // The banner is drawn only in the browser, so a returning visitor never sees it flash in the server HTML.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [reopened, setReopened] = useState(false);
  const pathname = usePathname();
  const loaded = useRef(false);
  const lastPath = useRef(pathname);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  useEffect(() => {
    if (consent === "granted") {
      if (!loaded.current) {
        loaded.current = true;
        lastPath.current = pathname;
        loadTrackers();
      } else if (lastPath.current !== pathname) {
        lastPath.current = pathname;
        trackRoutePageView();
      }
    } else if (consent === "denied" && loaded.current) {
      // Withdrawn after accepting: remove the cookies; the scripts stop with the next page load.
      clearTrackingCookies();
    }
  }, [consent, pathname]);

  if (!mounted || (consent !== "unknown" && !reopened)) return null;

  const choose = (value: "granted" | "denied") => {
    setConsent(value);
    setReopened(false);
  };

  return (
    <div
      role="dialog"
      aria-label="موافقة ملفات تعريف الارتباط"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-5 shadow-xl"
    >
      <p className="text-sm leading-7 text-foreground">
        نستخدم ملفات تعريف الارتباط (الكوكيز) لقياس زيارات الموقع وتحسين الإعلانات، ولا نفعّلها إلا بموافقتك. يمكنك تغيير اختيارك في أي وقت من أسفل الصفحة.{" "}
        <Link href="/privacy" className="font-bold text-accent underline">
          سياسة الخصوصية
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => choose("granted")}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          قبول
        </button>
        <button
          type="button"
          onClick={() => choose("denied")}
          className="rounded-full border border-border px-6 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-accent"
        >
          رفض
        </button>
      </div>
    </div>
  );
}
