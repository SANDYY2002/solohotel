import { prisma } from "@/lib/prisma";
import { requireAdmin, verifySessionToken, SESSION_COOKIE } from "@/lib/admin-auth";

export type CurrentStaff = { id: string; name: string; email: string; role: string };

/**
 * Verifies the session AND loads the staff account it belongs to — use
 * this instead of requireAdmin() whenever a route needs to know *who* is
 * acting (e.g. to attribute an activity log entry), not just *whether*
 * someone is logged in. Returns null if unauthenticated, the account is
 * deactivated, or the account was deleted after the session was issued.
 */
export async function getCurrentStaff(req: Request): Promise<CurrentStaff | null> {
  const session = await requireAdmin(req);
  if (!session) return null;
  return loadStaff(session.staffId);
}

/**
 * Same as getCurrentStaff(), for Server Components (page.tsx/layout.tsx),
 * which don't have a Request object — reads the cookie via next/headers
 * instead of a Cookie header.
 */
export async function getCurrentStaffFromCookies(): Promise<CurrentStaff | null> {
  const { cookies } = await import("next/headers");
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) return null;
  return loadStaff(session.staffId);
}

async function loadStaff(staffId: string): Promise<CurrentStaff | null> {
  const staff = await prisma.staffAccount.findUnique({ where: { id: staffId } });
  if (!staff || !staff.active) return null;
  return { id: staff.id, name: staff.name, email: staff.email, role: staff.role };
}
