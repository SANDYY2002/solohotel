import { NextResponse } from "next/server";
import { checkAdminPassword, createSessionToken, SESSION_COOKIE } from "@/lib/admin-auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/** Lets the login page know whether to show "sign in" or "create the first account." */
export async function GET() {
  const count = await prisma.staffAccount.count();
  return NextResponse.json({ needsSetup: count === 0 });
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

  const staffCount = await prisma.staffAccount.count();

  // --- Bootstrap: creating the very first (OWNER) account ---
  if (staffCount === 0) {
    const { setupKey, name, email, newPassword } = (body ?? {}) as Record<string, unknown>;

    if (typeof setupKey !== "string" || !checkAdminPassword(setupKey)) {
      await logActivity({
        action: "login_failed",
        entity: "auth",
        entityId: ip,
        summary: `Failed admin setup attempt from ${ip}`,
      });
      return NextResponse.json({ error: "Incorrect setup key." }, { status: 401 });
    }
    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid name and email." }, { status: 400 });
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    const staff = await prisma.staffAccount.create({
      data: { name: name.trim(), email: email.trim().toLowerCase(), passwordHash, role: "OWNER", lastLoginAt: new Date() },
    });

    await logActivity({
      action: "staff_created",
      entity: "staff",
      entityId: staff.id,
      summary: `${staff.name} created the first admin account (Owner)`,
      actorName: staff.name,
    });

    const token = await createSessionToken(staff.id);
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

  // --- Normal login: email + password against an existing StaffAccount ---
  const { email, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const staff = await prisma.staffAccount.findUnique({ where: { email: email.trim().toLowerCase() } });
  const valid = staff?.active && (await verifyPassword(password, staff.passwordHash));

  if (!staff || !valid) {
    await logActivity({
      action: "login_failed",
      entity: "auth",
      entityId: ip,
      summary: `Failed admin login attempt (${email}) from ${ip}`,
    });
    // Same message whether the email doesn't exist, the account is
    // deactivated, or the password is wrong — don't hint which.
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  await prisma.staffAccount.update({ where: { id: staff.id }, data: { lastLoginAt: new Date() } });
  await logActivity({
    action: "login_succeeded",
    entity: "staff",
    entityId: staff.id,
    summary: `${staff.name} signed in`,
    actorName: staff.name,
  });

  const token = await createSessionToken(staff.id);
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
