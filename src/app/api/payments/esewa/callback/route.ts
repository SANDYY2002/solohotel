import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content-store";
import { decodeEsewaCallbackData, verifyEsewaCallbackSignature, verifyEsewaTransactionStatus } from "@/lib/payments/esewa";
import { sendReservationConfirmation, sendStaffNotification } from "@/lib/email";
import { logActivity } from "@/lib/activity-log";
import { getBaseUrl } from "@/lib/base-url";

/**
 * eSewa redirects here whether the payment succeeded or failed — both
 * success_url and failure_url point at this same route (see initiate/route.ts)
 * so the actual outcome is always determined by the server-to-server status
 * check below, never by which URL the browser happened to land on.
 */
export async function GET(req: Request) {
  const base = getBaseUrl(req);
  const url = new URL(req.url);
  const dataParam = url.searchParams.get("data");

  function redirectResult(status: "success" | "failed", code?: string) {
    const dest = new URL("/booking-payment-result", base);
    dest.searchParams.set("status", status);
    if (code) dest.searchParams.set("code", code);
    return NextResponse.redirect(dest);
  }

  if (!dataParam) return redirectResult("failed");

  const data = decodeEsewaCallbackData(dataParam);
  if (!data) return redirectResult("failed");

  const signatureOk = await verifyEsewaCallbackSignature(data).catch(() => false);
  if (!signatureOk) return redirectResult("failed");

  // transaction_uuid was built as "{confirmationCode}-{timestamp}" in initiate/route.ts
  const confirmationCode = data.transaction_uuid.split("-").slice(0, -1).join("-") || data.transaction_uuid.split("-")[0];
  const reservation = await prisma.reservation.findUnique({ where: { confirmationCode } });
  if (!reservation) return redirectResult("failed");

  // The authoritative check — never trust the redirect alone.
  const verified = await verifyEsewaTransactionStatus({
    transactionUuid: data.transaction_uuid,
    totalAmount: Number(data.total_amount),
  }).catch(() => ({ complete: false, status: "VERIFY_ERROR" }));

  if (!verified.complete) {
    await logActivity({
      action: "payment_failed",
      entity: "reservation",
      entityId: reservation.id,
      summary: `eSewa payment for ${reservation.confirmationCode} did not complete (status: ${verified.status})`,
    });
    await prisma.reservation.update({ where: { id: reservation.id }, data: { paymentStatus: "FAILED" } });
    return redirectResult("failed", reservation.confirmationCode);
  }

  const updated = await prisma.reservation.update({
    where: { id: reservation.id },
    data: {
      paymentStatus: "PAID",
      paymentMethod: "ESEWA",
      paymentTxnId: data.transaction_code,
      paymentAmountNpr: Number(data.total_amount),
      paidAt: new Date(),
      status: "CONFIRMED",
    },
  });

  await logActivity({
    action: "payment_succeeded",
    entity: "reservation",
    entityId: updated.id,
    summary: `Received eSewa payment of NPR ${data.total_amount} for ${updated.confirmationCode} — reservation confirmed`,
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
      text: `${updated.guestName} paid NPR ${data.total_amount} via eSewa for ${updated.roomName}. Reservation is now confirmed.`,
    }),
  ]);

  return redirectResult("success", updated.confirmationCode);
}
