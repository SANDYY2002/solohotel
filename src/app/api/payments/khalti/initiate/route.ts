import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content-store";
import { initiateKhaltiPayment } from "@/lib/payments/khalti";
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

  try {
    const result = await initiateKhaltiPayment({
      amountNpr,
      purchaseOrderId: `${reservation.confirmationCode}-${Date.now()}`,
      purchaseOrderName: `${reservation.roomName} — ${reservation.confirmationCode}`,
      returnUrl: `${base}/api/payments/khalti/callback`,
      websiteUrl: base,
      customerName: reservation.guestName,
      customerEmail: reservation.guestEmail,
      customerPhone: reservation.guestPhone ?? undefined,
    });
    return NextResponse.json({ paymentUrl: result.payment_url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Khalti initiate failed." }, { status: 502 });
  }
}
