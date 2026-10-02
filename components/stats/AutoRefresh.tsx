"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const INTERVAL_MS = 30_000;
const STORAGE_KEY = "alamir_stats_autorefresh";

/** Reloads the page's data every 30 seconds while switched on, so visitors appear without pressing refresh. */
export default function AutoRefresh() {
  const router = useRouter();
  const [on, setOn] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "off";
    } catch {
      return true;
    }
  });
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!on) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
      setUpdatedAt(new Date());
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [on, router]);

  const toggle = () => {
    const next = !on;
    setOn(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      // Storage blocked: the choice lasts until the page is closed.
    }
  };

  const time = updatedAt?.toLocaleTimeString("ar-EG-u-nu-latn", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="flex items-center gap-3 text-sm text-muted">
      <button
        type="button"
        onClick={toggle}
        suppressHydrationWarning
        aria-pressed={on}
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 font-bold hover:text-foreground"
      >
        <span suppressHydrationWarning className={`h-2.5 w-2.5 rounded-full ${on ? "animate-pulse bg-green-500" : "bg-slate-400"}`} />
        <span suppressHydrationWarning>{on ? "تحديث تلقائي: يعمل" : "تحديث تلقائي: متوقف"}</span>
      </button>
      {time && <span className="hidden sm:inline">آخر تحديث {time}</span>}
      <button type="button" onClick={() => { router.refresh(); setUpdatedAt(new Date()); }} className="rounded-xl border border-border bg-surface px-3 py-2 font-bold hover:text-foreground">
        تحديث الآن
      </button>
    </div>
  );
}
