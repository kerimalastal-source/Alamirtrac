// Password gate for the statistics page. The password is STATS_PASSWORD (a
// Vercel environment variable); after a correct one the browser keeps an
// httpOnly cookie holding an HMAC of it, never the password itself. With no
// STATS_PASSWORD set the page stays closed.
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const STATS_COOKIE = "alamir_stats";
export const STATS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const statsConfigured = () => Boolean(process.env.STATS_PASSWORD);

async function tokenFor(password: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("alamirtrac-stats-v1"));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sameToken(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** The cookie value to set when `password` is the right one, else null. */
export async function tokenIfPasswordMatches(password: string): Promise<string | null> {
  const expected = process.env.STATS_PASSWORD;
  if (!expected) return null;
  const [given, wanted] = await Promise.all([tokenFor(password), tokenFor(expected)]);
  return sameToken(given, wanted) ? wanted : null;
}

/** The request carries the cookie of a correct password. */
export async function isStatsAuthed(): Promise<boolean> {
  const password = process.env.STATS_PASSWORD;
  if (!password) return false;
  const value = (await cookies()).get(STATS_COOKIE)?.value;
  return Boolean(value) && sameToken(value!, await tokenFor(password));
}
