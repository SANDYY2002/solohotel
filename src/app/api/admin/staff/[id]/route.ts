import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/current-staff";
import { hashPassword } from "@/lib/password";
import { logActivity } from "@/lib/activity-log";

async function countActiveOwners(excludingId?: string): Promise<number> {
  return prisma.staffAccount.count({
    where: { role: "OWNER", active: true, ...(excludingId ? { id: { not: excludingId } } : {}) },
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const staff = await getCurrentStaff(req);
  if (!staff || staff.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can manage staff accounts." }, { status: 403 });
  }

  const target = await prisma.staffAccount.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data: { active?: boolean; role?: string; passwordHash?: string } = {};

  if (typeof body.active === "boolean") {
    // Refuse to deactivate the last active owner — would lock everyone out.
    if (!body.active && target.role === "OWNER") {
      const remaining = await countActiveOwners(target.id);
      if (remaining === 0) {
        return NextResponse.json({ error: "Can't deactivate the last active owner." }, { status: 400 });
      }
    }
    data.active = body.active;
  }

  if (typeof body.role === "string" && ["OWNER", "STAFF"].includes(body.role)) {
    if (body.role === "STAFF" && target.role === "OWNER") {
      const remaining = await countActiveOwners(target.id);
      if (remaining === 0) {
        return NextResponse.json({ error: "Can't demote the last active owner." }, { status: 400 });
      }
    }
    data.role = body.role;
  }

  if (typeof body.newPassword === "string") {
    if (body.newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    data.passwordHash = await hashPassword(body.newPassword);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const updated = await prisma.staffAccount.update({
    where: { id: target.id },
    data,
    select: { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true, createdAt: true },
  });

  await logActivity({
    action: "staff_updated",
    entity: "staff",
    entityId: updated.id,
    summary: `${staff.name} updated ${updated.name}'s account${data.active !== undefined ? (data.active ? " (reactivated)" : " (deactivated)") : ""}${data.role ? ` (role: ${data.role})` : ""}${data.passwordHash ? " (password reset)" : ""}`,
    actorName: staff.name,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const staff = await getCurrentStaff(req);
  if (!staff || staff.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can manage staff accounts." }, { status: 403 });
  }
  if (staff.id === params.id) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }

  const target = await prisma.staffAccount.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (target.role === "OWNER") {
    const remaining = await countActiveOwners(target.id);
    if (remaining === 0) {
      return NextResponse.json({ error: "Can't delete the last active owner." }, { status: 400 });
    }
  }

  await prisma.staffAccount.delete({ where: { id: target.id } });
  await logActivity({
    action: "staff_deleted",
    entity: "staff",
    entityId: target.id,
    summary: `${staff.name} deleted the account for ${target.name} (${target.email})`,
    actorName: staff.name,
  });

  return NextResponse.json({ ok: true });
}
