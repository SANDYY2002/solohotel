import { NextResponse } from "next/server";
import { checkAdminPassword, createSessionToken, SESSION_COOKIE } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // Brute-force protection: block further attempts from an IP after too
  // many failures in a short window. Uses the existing activity log as
  // the tracking store rather than adding a dedicated table.
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
  let recentFailures = 0;
  try {
    recentFailures = await prisma.adminActivityLog.count({
      where: { action: "login_failed", entityId: ip, createdAt: { gte: since } },
    });
  } catch {
    // If the activity log is unavailable for some reason, fail open on
    // rate limiting rather than locking everyone out of the admin login.
  }

  if (recentFailures >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${WINDOW_MINUTES} minutes.` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { password } = (body ?? {}) as Record<string, unknown>;

  if (typeof password !== "string" || !checkAdminPassword(password)) {
    await logActivity({
      action: "login_failed",
      entity: "auth",
      entityId: ip,
      summary: `Failed admin login attempt from ${ip}`,
    });
    // Same message either way — don't hint whether a password was "close."
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
