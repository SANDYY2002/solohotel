import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

async function requireAdmin(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return verifySessionToken(match?.[1]);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { status } = (await req.json()) as { status?: string };
  if (!["HELD", "CONFIRMED", "CANCELLED"].includes(status ?? "")) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await prisma.reservation.update({
    where: { id: params.id },
    data: { status: status as "HELD" | "CONFIRMED" | "CANCELLED" },
  });

  return NextResponse.json(updated);
}
