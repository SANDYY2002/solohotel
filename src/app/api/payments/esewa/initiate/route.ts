import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content-store";
import { buildEsewaFormFields, esewaFormUrl } from "@/lib/payments/esewa";
import { usdToNpr, depositAmountUsd } from "@/lib/currency";
import { getBaseUrl } from "@/lib/base-url";

export async function POST(req: Request) {
  const { reservationId, email } = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof reservationId !== "string" || typeof email !== "string") {
    return NextResponse.json({ error: "Missing reservation details." }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
  if (!reservation || reservation.guestEmail.toLowerCase() !== email.trim().toLowerCase()) {
    return NextResponse.json({ error: "We couldn't verify that reservation." }, { status: 404 });
  }
  if (reservation.paymentStatus === "PAID") {
    return NextResponse.json({ error: "This reservation is already paid." }, { status: 400 });
  }
  if (reservation.status === "CANCELLED") {
    return NextResponse.json({ error: "This reservation has been cancelled." }, { status: 400 });
  }

  const { siteConfig } = await getSiteContent();
  const dueUsd = depositAmountUsd(reservation.totalPriceUsd, siteConfig.depositPercentage);
  const amountNpr = usdToNpr(dueUsd, siteConfig.usdToNprRate);

  const base = getBaseUrl(req);
  // eSewa reuses one transaction_uuid per attempt — include a timestamp so
  // retrying a failed payment doesn't collide with the earlier attempt.
  const transactionUuid = `${reservation.confirmationCode}-${Date.now()}`;

  const fields = await buildEsewaFormFields({
    amountNpr,
    transactionUuid,
    successUrl: `${base}/api/payments/esewa/callback`,
    failureUrl: `${base}/api/payments/esewa/callback`,
  });

  return NextResponse.json({ formUrl: esewaFormUrl(), fields });
}
