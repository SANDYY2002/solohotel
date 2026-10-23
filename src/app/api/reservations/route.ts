import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content-store";
import { nightsBetween } from "@/lib/utils";
import { sendReservationConfirmation, sendStaffNotification } from "@/lib/email";
import { logActivity } from "@/lib/activity-log";
import { depositAmountUsd } from "@/lib/currency";

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

  const { rooms, siteConfig } = await getSiteContent();
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
  const dueUsd = depositAmountUsd(totalPriceUsd, siteConfig.depositPercentage);
  const requiresPayment = dueUsd > 0;

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
      // No deposit configured (0%) means nothing to collect online — treat
      // as confirmed and paid immediately, same as the old pay-at-property
      // behavior this project started with.
      status: requiresPayment ? "HELD" : "CONFIRMED",
      paymentStatus: requiresPayment ? "PENDING" : "PAID",
      paidAt: requiresPayment ? null : new Date(),
    },
  });

  if (!requiresPayment) {
    // Nothing to collect online — this is as confirmed as it'll get, so
    // send the guest their confirmation right away like before.
    const [guestEmailResult, staffEmailResult] = await Promise.all([
      sendReservationConfirmation({
        guestEmail: reservation.guestEmail,
        guestName: reservation.guestName,
        confirmationCode: reservation.confirmationCode,
        roomName: reservation.roomName,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guests: reservation.guests,
        totalPriceUsd: reservation.totalPriceUsd,
        hotelName: siteConfig.name,
        hotelEmail: siteConfig.email,
        hotelPhone: siteConfig.phone,
      }),
      sendStaffNotification({
        hotelEmail: siteConfig.email,
        subject: `New reservation — ${reservation.confirmationCode}`,
        text: `${reservation.guestName} (${reservation.guestEmail}) booked ${reservation.roomName} for ${reservation.checkIn} to ${reservation.checkOut}. Total: $${reservation.totalPriceUsd.toLocaleString()}.`,
      }),
    ]);
    if (!guestEmailResult.sent || !staffEmailResult.sent) {
      await logActivity({
        action: "email_failed",
        entity: "reservation",
        entityId: reservation.id,
        summary: `Confirmation email(s) for ${reservation.confirmationCode} did not send: ${[
          !guestEmailResult.sent && `guest (${guestEmailResult.error})`,
          !staffEmailResult.sent && `staff (${staffEmailResult.error})`,
        ]
          .filter(Boolean)
          .join(", ")}`,
      });
    }
  } else {
    // Payment still pending — the guest hasn't been promised a confirmed
    // room yet, so no guest email until payment actually succeeds (see
    // the /api/payments/*/callback routes). Staff still get visibility
    // into the attempt, in case the guest abandons at the payment step.
    const staffEmailResult = await sendStaffNotification({
      hotelEmail: siteConfig.email,
      subject: `Reservation pending payment — ${reservation.confirmationCode}`,
      text: `${reservation.guestName} (${reservation.guestEmail}) started booking ${reservation.roomName} for ${reservation.checkIn} to ${reservation.checkOut} and is being directed to pay $${dueUsd.toLocaleString()}. Will confirm automatically once payment completes.`,
    });
    if (!staffEmailResult.sent) {
      await logActivity({
        action: "email_failed",
        entity: "reservation",
        entityId: reservation.id,
        summary: `Staff notification for pending reservation ${reservation.confirmationCode} did not send: ${staffEmailResult.error}`,
      });
    }
  }

  return NextResponse.json(
    {
      reservationId: reservation.id,
      confirmationCode: reservation.confirmationCode,
      totalPriceUsd,
      nights,
      dueUsd,
      requiresPayment,
    },
    { status: 201 }
  );
}
