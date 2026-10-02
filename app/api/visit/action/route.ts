// Counts a click on a WhatsApp, phone, email or social link, or a form submission. Sent by
// components/VisitorTracker.tsx with sendBeacon; same anonymous session id.
import { isBot, isTrackedPath, recordAction, visitsSql } from "@/lib/visits";

const KINDS = new Set(["whatsapp", "email", "phone", "facebook", "instagram", "form"]);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : "";
  const kind = typeof body.kind === "string" ? body.kind : "";
  const path = typeof body.path === "string" ? body.path.slice(0, 300) : null;
  if (!sessionId || !KINDS.has(kind)) return new Response(null, { status: 400 });
  if (isBot(request.headers.get("user-agent")) || (path && !isTrackedPath(path))) return new Response(null, { status: 204 });

  try {
    await recordAction(visitsSql(), { sessionId, kind, path });
  } catch (error) {
    console.error("[visit] action save failed", error instanceof Error ? error.message : error);
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
