import { NextResponse } from "next/server";
import { checkAdminPassword, createSessionToken, SESSION_COOKIE } from "@/lib/admin-auth";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { password } = (body ?? {}) as Record<string, unknown>;

  if (typeof password !== "string" || !checkAdminPassword(password)) {
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
