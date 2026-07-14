import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/current-staff";
import { logActivity } from "@/lib/activity-log";

const VALID_STATUSES = ["NEW", "READ", "RESPONDED"];

export async function POST(req: Request) {
  const staff = await getCurrentStaff(req);
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { ids, status } = (await req.json()) as { ids?: string[]; status?: string };

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "\"ids\" must be a non-empty array." }, { status: 400 });
  }
  if (!VALID_STATUSES.includes(status ?? "")) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const result = await prisma.contactSubmission.updateMany({
    where: { id: { in: ids } },
    data: { status: status as "NEW" | "READ" | "RESPONDED" },
  });

  await logActivity({
    action: "bulk_status_changed",
    entity: "contact",
    summary: `Bulk-updated ${result.count} message${result.count !== 1 ? "s" : ""} to ${status}`,
    actorName: staff.name,
  });

  return NextResponse.json({ count: result.count });
}
