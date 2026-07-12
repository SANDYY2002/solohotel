import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public lookup for a guest to find their own reservation — requires both
 * the confirmation code AND the email it was booked under, so this can't
 * be used to browse other guests' bookings by guessing codes. Deliberately
 * returns the same generic "not found" whether the code doesn't exist or
 * the email just doesn't match it, so a wrong guess can't be used to
 * confirm a code is real.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { confirmationCode, email } = (body ?? {}) as Record<string, unknown>;
  if (typeof confirmationCode !== "string" || typeof email !== "string" || !confirmationCode.trim() || !email.trim()) {
    return NextResponse.json({ error: "Enter your confirmation code and the email you booked with." }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({
    where: { confirmationCode: confirmationCode.trim().toUpperCase() },
  });

  if (!reservation || reservation.guestEmail.toLowerCase() !== email.trim().toLowerCase()) {
    return NextResponse.json(
      { error: "We couldn't find a reservation matching that confirmation code and email." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: reservation.id,
    confirmationCode: reservation.confirmationCode,
    roomName: reservation.roomName,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    guests: reservation.guests,
    totalPriceUsd: reservation.totalPriceUsd,
    guestName: reservation.guestName,
    guestEmail: reservation.guestEmail,
    specialRequests: reservation.specialRequests,
    status: reservation.status,
  });
}
