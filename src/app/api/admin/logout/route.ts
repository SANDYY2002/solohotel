import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/admin-auth";
import { getCurrentStaff } from "@/lib/current-staff";
import { logActivity } from "@/lib/activity-log";

export async function POST(req: Request) {
  const staff = await getCurrentStaff(req);
  if (staff) {
    await logActivity({
      action: "logout",
      entity: "staff",
      entityId: staff.id,
      summary: `${staff.name} signed out`,
      actorName: staff.name,
    });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
