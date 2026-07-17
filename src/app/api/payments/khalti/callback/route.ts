import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content-store";
import { lookupKhaltiPayment } from "@/lib/payments/khalti";
import { sendReservationConfirmation, sendStaffNotification } from "@/lib/email";
import { logActivity } from "@/lib/activity-log";
import { getBaseUrl } from "@/lib/base-url";

/**
 * Khalti redirects here after the guest completes (or abandons) payment,
 * with a `pidx` query param — that param alone proves nothing (it's
 * visible in the URL and trivially replayable), so the actual outcome is
 * always determined by calling Khalti's lookup API below.
 */
export async function GET(req: Request) {
  const base = getBaseUrl(req);
  const url = new URL(req.url);
  const pidx = url.searchParams.get("pidx");
  // Khalti also echoes purchase_order_id, which we built as "{confirmationCode}-{timestamp}"
  const purchaseOrderId = url.searchParams.get("purchase_order_id");

  function redirectResult(status: "success" | "failed", code?: string) {
    const dest = new URL("/booking-payment-result", base);
    dest.searchParams.set("status", status);
    if (code) dest.searchParams.set("code", code);
    return NextResponse.redirect(dest);
  }

  if (!pidx) return redirectResult("failed");

  const lookup = await lookupKhaltiPayment(pidx).catch(() => null);
  if (!lookup) return redirectResult("failed");

  const confirmationCode = purchaseOrderId?.split("-").slice(0, -1).join("-") || purchaseOrderId?.split("-")[0];
  const reservation = confirmationCode
    ? await prisma.reservation.findUnique({ where: { confirmationCode } })
    : null;
  if (!reservation) return redirectResult("failed");

  if (lookup.status !== "Completed") {
    await logActivity({
      action: "payment_failed",
      entity: "reservation",
      entityId: reservation.id,
      summary: `Khalti payment for ${reservation.confirmationCode} did not complete (status: ${lookup.status})`,
    });
    await prisma.reservation.update({ where: { id: reservation.id }, data: { paymentStatus: "FAILED" } });
    return redirectResult("failed", reservation.confirmationCode);
  }

  const paidNpr = Math.round(lookup.total_amount / 100); // Khalti reports amount in paisa
  const updated = await prisma.reservation.update({
    where: { id: reservation.id },
    data: {
      paymentStatus: "PAID",
      paymentMethod: "KHALTI",
      paymentTxnId: lookup.transaction_id ?? pidx,
      paymentAmountNpr: paidNpr,
      paidAt: new Date(),
      status: "CONFIRMED",
    },
  });

  await logActivity({
    action: "payment_succeeded",
    entity: "reservation",
    entityId: updated.id,
    summary: `Received Khalti payment of NPR ${paidNpr} for ${updated.confirmationCode} — reservation confirmed`,
  });

  const { siteConfig } = await getSiteContent();
  await Promise.all([
    sendReservationConfirmation({
      guestEmail: updated.guestEmail,
      guestName: updated.guestName,
      confirmationCode: updated.confirmationCode,
      roomName: updated.roomName,
      checkIn: updated.checkIn,
      checkOut: updated.checkOut,
      guests: updated.guests,
      totalPriceUsd: updated.totalPriceUsd,
      hotelName: siteConfig.name,
      hotelEmail: siteConfig.email,
      hotelPhone: siteConfig.phone,
    }),
    sendStaffNotification({
      hotelEmail: siteConfig.email,
      subject: `Payment received — ${updated.confirmationCode}`,
      text: `${updated.guestName} paid NPR ${paidNpr} via Khalti for ${updated.roomName}. Reservation is now confirmed.`,
    }),
  ]);

  return redirectResult("success", updated.confirmationCode);
}
