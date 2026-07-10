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
  if (!["NEW", "READ", "RESPONDED"].includes(status ?? "")) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await prisma.contactSubmission.update({
    where: { id: params.id },
    data: { status: status as "NEW" | "READ" | "RESPONDED" },
  });

  return NextResponse.json(updated);
}
