// How a visitor used a page: seconds visible, deepest scroll and seconds with
// touch, mouse or keyboard input. Sent by components/VisitorTracker.tsx when the
// page is hidden or left; the visit's Telegram alert is then rewritten with the
// updated "is it a person" verdict (lib/visit-insights.ts).
import { after } from "next/server";
import { hasTelegramConfigured } from "@/lib/telegram";
import { isBot, recordEngagement, refreshAlert, visitsSql } from "@/lib/visits";

const whole = (value: unknown, max: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.round(n))) : null;
};

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : "";
  const viewId = typeof body.viewId === "string" ? body.viewId.slice(0, 64) : "";
  const active = whole(body.active, 86400);
  const scroll = whole(body.scroll, 100);
  const interactions = whole(body.interactions, 100000);
  if (!sessionId || !viewId || active == null || scroll == null || interactions == null) return new Response(null, { status: 400 });
  if (isBot(request.headers.get("user-agent"))) return new Response(null, { status: 204 });

  try {
    const sql = visitsSql();
    const matched = await recordEngagement(sql, { sessionId, viewId, active, scroll, interactions });
    if (matched && hasTelegramConfigured()) {
      after(() =>
        refreshAlert(sql, sessionId).catch((error) =>
          console.error("[visit] alert refresh failed", error instanceof Error ? error.message : error),
        ),
      );
    }
  } catch (error) {
    console.error("[visit] engagement save failed", error instanceof Error ? error.message : error);
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
