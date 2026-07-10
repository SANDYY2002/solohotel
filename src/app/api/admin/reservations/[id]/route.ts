import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity-log";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await req.json()) as { status?: string; notes?: string };
  const data: { status?: "HELD" | "CONFIRMED" | "CANCELLED"; notes?: string | null } = {};

  if (body.status !== undefined) {
    if (!["HELD", "CONFIRMED", "CANCELLED"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    data.status = body.status as "HELD" | "CONFIRMED" | "CANCELLED";
  }
  if (body.notes !== undefined) {
    data.notes = body.notes.trim() ? body.notes : null;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const before = await prisma.reservation.findUnique({ where: { id: params.id } });
  const updated = await prisma.reservation.update({ where: { id: params.id }, data });

  if (data.status && before && before.status !== data.status) {
    await logActivity({
      action: "status_changed",
      entity: "reservation",
      entityId: updated.id,
      summary: `Reservation ${updated.confirmationCode} (${updated.guestName}) moved from ${before.status} to ${data.status}`,
    });
  }
  if (data.notes !== undefined) {
    await logActivity({
      action: "notes_updated",
      entity: "reservation",
      entityId: updated.id,
      summary: `Notes updated on reservation ${updated.confirmationCode}`,
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const existing = await prisma.reservation.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.reservation.delete({ where: { id: params.id } });
  await logActivity({
    action: "deleted",
    entity: "reservation",
    entityId: params.id,
    summary: `Deleted reservation ${existing.confirmationCode} for ${existing.guestName}`,
  });

  return NextResponse.json({ ok: true });
}
