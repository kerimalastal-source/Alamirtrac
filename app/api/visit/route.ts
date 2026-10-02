// Anonymous page-view beacon, sent by components/VisitorTracker.tsx on every
// page. Stores no PII: the session id is a random UUID kept in the tab's
// sessionStorage, the place comes from Vercel's geo headers, and neither the IP
// address nor the user agent is stored. Saving and Telegram alerts live in
// lib/visits.ts. Same pattern as hadarahospitality's track-visit.
import { after, NextResponse } from "next/server";
import { classifySource, parseAdTouch } from "@/lib/attribution";
import { hasTelegramConfigured } from "@/lib/telegram";
import { parseUserAgent } from "@/lib/visit-insights";
import { isBot, isTrackedPath, notifyTeam, recordVisit, removeOldVisits, visitsSql, type Visit } from "@/lib/visits";

// A new session's alert waits a few seconds (lib/visits.ts SETTLE_MS) after the response.
export const maxDuration = 30;

const MAX_LEN = 300;

function str(value: unknown, max = MAX_LEN): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed || null;
}

/** Runs `task` after the response is on its way; a failure is only logged. */
function afterResponse(label: string, task: () => Promise<void>) {
  after(() => task().catch((error) => console.error(`[visit] ${label} failed`, error instanceof Error ? error.message : error)));
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const sessionId = str(body.sessionId, 100);
  const path = str(body.path);
  if (!sessionId || !path) return NextResponse.json({ ok: false }, { status: 400 });

  const userAgent = request.headers.get("user-agent");
  if (isBot(userAgent) || !isTrackedPath(path)) return NextResponse.json({ ok: true, tracked: false });

  const city = request.headers.get("x-vercel-ip-city");
  let cityDecoded: string | null = null;
  if (city) {
    try {
      cityDecoded = decodeURIComponent(city);
    } catch {
      cityDecoded = city;
    }
  }

  // Sent with a session's first page only: where the visitor came from.
  const touch = parseAdTouch(body.touch);
  const source = touch ? classifySource(touch, new URL(request.url).hostname) : null;
  const visit: Visit = {
    sessionId,
    path,
    locale: str(body.locale, 10),
    referrer: str(body.referrer, 500),
    country: request.headers.get("x-vercel-ip-country"),
    city: cityDecoded,
    source: source?.source ?? null,
    medium: source?.medium ?? null,
    campaign: source?.campaign ?? null,
    ...parseUserAgent(userAgent),
    viewId: str(body.viewId, 64),
    tz: str(body.tz, 64),
    screen: typeof body.screen === "string" && /^\d{2,5}x\d{2,5}$/.test(body.screen) ? body.screen : null,
    webdriver: typeof body.webdriver === "boolean" ? body.webdriver : null,
  };

  try {
    const sql = visitsSql();
    const state = await recordVisit(sql, visit);
    if (hasTelegramConfigured()) afterResponse("telegram alert", () => notifyTeam(sql, visit, state));
    // These tables have no other retention job: occasionally trim old rows.
    if (Math.random() < 0.01) afterResponse("cleanup", () => removeOldVisits(sql));
  } catch (error) {
    console.error("[visit] save failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
