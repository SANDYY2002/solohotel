import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content-store";
import { sendCancellationConfirmation, sendStaffNotification } from "@/lib/email";
import { logActivity } from "@/lib/activity-log";

/**
 * Guest-facing cancellation — re-verifies confirmationCode + email match
 * server-side rather than trusting the :id in the URL alone, so this can't
 * be used to cancel someone else's reservation just by guessing an id.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { confirmationCode, email } = (body ?? {}) as Record<string, unknown>;
  if (typeof confirmationCode !== "string" || typeof email !== "string") {
    return NextResponse.json({ error: "Missing confirmation details." }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({ where: { id: params.id } });

  if (
    !reservation ||
    reservation.confirmationCode !== confirmationCode.trim().toUpperCase() ||
    reservation.guestEmail.toLowerCase() !== email.trim().toLowerCase()
  ) {
    return NextResponse.json({ error: "We couldn't verify that reservation." }, { status: 404 });
  }

  if (reservation.status === "CANCELLED") {
    return NextResponse.json({ error: "This reservation is already cancelled." }, { status: 400 });
  }

  const updated = await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: "CANCELLED" },
  });

  await logActivity({
    action: "cancelled_by_guest",
    entity: "reservation",
    entityId: updated.id,
    summary: `${updated.guestName} cancelled reservation ${updated.confirmationCode} themselves`,
  });

  const { siteConfig } = await getSiteContent();
  await Promise.all([
    sendCancellationConfirmation({
      guestEmail: updated.guestEmail,
      guestName: updated.guestName,
      confirmationCode: updated.confirmationCode,
      roomName: updated.roomName,
      hotelName: siteConfig.name,
      hotelEmail: siteConfig.email,
      hotelPhone: siteConfig.phone,
    }),
    sendStaffNotification({
      hotelEmail: siteConfig.email,
      subject: `Guest cancelled — ${updated.confirmationCode}`,
      text: `${updated.guestName} (${updated.guestEmail}) cancelled their own reservation for ${updated.roomName}, ${updated.checkIn} to ${updated.checkOut}.`,
    }),
  ]);

  return NextResponse.json({ ok: true, status: updated.status });
}
