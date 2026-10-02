import { NextResponse } from "next/server";
import { STATS_COOKIE, STATS_COOKIE_MAX_AGE, tokenIfPasswordMatches } from "@/lib/stats-auth";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const password = String(form?.get("password") ?? "");
  const token = await tokenIfPasswordMatches(password);
  const back = new URL("/admin/stats", request.url);

  if (!token) {
    // A pause makes guessing the password slow.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    back.searchParams.set("error", "1");
    return NextResponse.redirect(back, 303);
  }

  const response = NextResponse.redirect(back, 303);
  response.cookies.set(STATS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: STATS_COOKIE_MAX_AGE,
  });
  return response;
}
