import { NextResponse } from "next/server";
import { STATS_COOKIE } from "@/lib/stats-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/stats", request.url), 303);
  response.cookies.delete(STATS_COOKIE);
  return response;
}
