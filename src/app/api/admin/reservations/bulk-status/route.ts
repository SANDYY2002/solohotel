import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity-log";

const VALID_STATUSES = ["HELD", "CONFIRMED", "CANCELLED"];

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { ids, status } = (await req.json()) as { ids?: string[]; status?: string };

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "\"ids\" must be a non-empty array." }, { status: 400 });
  }
  if (!VALID_STATUSES.includes(status ?? "")) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const result = await prisma.reservation.updateMany({
    where: { id: { in: ids } },
    data: { status: status as "HELD" | "CONFIRMED" | "CANCELLED" },
  });

  await logActivity({
    action: "bulk_status_changed",
    entity: "reservation",
    summary: `Bulk-updated ${result.count} reservation${result.count !== 1 ? "s" : ""} to ${status}`,
  });

  return NextResponse.json({ count: result.count });
}
