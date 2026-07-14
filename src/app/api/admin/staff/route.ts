import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentStaff } from "@/lib/current-staff";
import { hashPassword } from "@/lib/password";
import { logActivity } from "@/lib/activity-log";

export async function GET(req: Request) {
  const staff = await getCurrentStaff(req);
  if (!staff || staff.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can manage staff accounts." }, { status: 403 });
  }

  const all = await prisma.staffAccount.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true, createdAt: true },
  });
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const staff = await getCurrentStaff(req);
  if (!staff || staff.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can manage staff accounts." }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const { name, email, password, role } = body;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Enter a name." }, { status: 400 });
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  const finalRole = role === "OWNER" ? "OWNER" : "STAFF";

  const existing = await prisma.staffAccount.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const created = await prisma.staffAccount.create({
    data: { name: name.trim(), email: email.trim().toLowerCase(), passwordHash, role: finalRole },
    select: { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true, createdAt: true },
  });

  await logActivity({
    action: "staff_created",
    entity: "staff",
    entityId: created.id,
    summary: `${staff.name} created a ${finalRole.toLowerCase()} account for ${created.name} (${created.email})`,
    actorName: staff.name,
  });

  return NextResponse.json(created, { status: 201 });
}
