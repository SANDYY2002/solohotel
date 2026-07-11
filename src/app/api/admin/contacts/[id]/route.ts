import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity-log";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await req.json()) as { status?: string; notes?: string };
  const data: { status?: "NEW" | "READ" | "RESPONDED"; notes?: string | null } = {};

  if (body.status !== undefined) {
    if (!["NEW", "READ", "RESPONDED"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    data.status = body.status as "NEW" | "READ" | "RESPONDED";
  }
  if (body.notes !== undefined) {
    data.notes = body.notes.trim() ? body.notes : null;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const before = await prisma.contactSubmission.findUnique({ where: { id: params.id } });
  const updated = await prisma.contactSubmission.update({ where: { id: params.id }, data });

  if (data.status && before && before.status !== data.status) {
    await logActivity({
      action: "status_changed",
      entity: "contact",
      entityId: updated.id,
      summary: `Contact message from ${updated.name} moved from ${before.status} to ${data.status}`,
    });
  }
  if (data.notes !== undefined) {
    await logActivity({
      action: "notes_updated",
      entity: "contact",
      entityId: updated.id,
      summary: `Notes updated on contact message from ${updated.name}`,
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const existing = await prisma.contactSubmission.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.contactSubmission.delete({ where: { id: params.id } });
  await logActivity({
    action: "deleted",
    entity: "contact",
    entityId: params.id,
    summary: `Deleted contact message from ${existing.name} (${existing.email})`,
  });

  return NextResponse.json({ ok: true });
}
