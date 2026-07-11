import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content-store";
import { nightsBetween } from "@/lib/utils";

function generateConfirmationCode() {
  return `YKN-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    roomSlug,
    checkIn,
    checkOut,
    guests,
    promoCode,
    guestName,
    guestEmail,
    guestPhone,
    specialRequests,
  } = (body ?? {}) as Record<string, unknown>;

  const { rooms } = await getSiteContent();
  const room = rooms.find((r) => r.slug === roomSlug);
  if (!room) {
    return NextResponse.json({ error: "Unknown room type." }, { status: 400 });
  }
  if (!room.available) {
    return NextResponse.json({ error: "That room is currently sold out." }, { status: 409 });
  }
  if (typeof checkIn !== "string" || typeof checkOut !== "string" || new Date(checkOut) <= new Date(checkIn)) {
    return NextResponse.json({ error: "Check-out must be after check-in." }, { status: 400 });
  }

  // Prevent double-booking: reject if any non-cancelled reservation for this
  // room has overlapping dates. checkIn/checkOut are stored as "YYYY-MM-DD"
  // strings, so lexicographic comparison is equivalent to date comparison.
  const overlapping = await prisma.reservation.findFirst({
    where: {
      roomSlug: room.slug,
      status: { not: "CANCELLED" },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  });
  if (overlapping) {
    return NextResponse.json(
      { error: "This room is already booked for part of that date range. Please choose different dates." },
      { status: 409 }
    );
  }
  if (typeof guestName !== "string" || !guestName.trim()) {
    return NextResponse.json({ error: "Guest name is required." }, { status: 400 });
  }
  if (typeof guestEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
    return NextResponse.json({ error: "A valid guest email is required." }, { status: 400 });
  }

  const nights = nightsBetween(checkIn, checkOut);
  const promo = typeof promoCode === "string" && promoCode.trim().toUpperCase() === "YUKIN10" ? 0.1 : 0;
  const totalPriceUsd = Math.round(room.pricePerNight * nights * (1 - promo));

  let confirmationCode = generateConfirmationCode();
  // Guard against the (astronomically unlikely) collision on the unique code.
  for (let attempts = 0; attempts < 5; attempts++) {
    const clash = await prisma.reservation.findUnique({ where: { confirmationCode } });
    if (!clash) break;
    confirmationCode = generateConfirmationCode();
  }

  const reservation = await prisma.reservation.create({
    data: {
      confirmationCode,
      roomSlug: room.slug,
      roomName: room.name,
      checkIn,
      checkOut,
      guests: typeof guests === "number" ? guests : Number(guests) || 1,
      promoCode: typeof promoCode === "string" && promoCode.trim() ? promoCode.trim() : null,
      totalPriceUsd,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: typeof guestPhone === "string" && guestPhone.trim() ? guestPhone.trim() : null,
      specialRequests: typeof specialRequests === "string" && specialRequests.trim() ? specialRequests.trim() : null,
    },
  });

  // In production: send the guest a confirmation email, and notify front desk.

  return NextResponse.json(
    { confirmationCode: reservation.confirmationCode, totalPriceUsd, nights },
    { status: 201 }
  );
}
