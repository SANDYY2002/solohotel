import { Resend } from "resend";

/**
 * Transactional email, gated on RESEND_API_KEY being set — same pattern as
 * BLOB_READ_WRITE_TOKEN for image uploads. Without it, every function here
 * just logs and returns rather than throwing, so booking/contact flows are
 * never blocked by missing email configuration.
 *
 * Sign up free at resend.com, create an API key, and set RESEND_API_KEY.
 * By default this sends from Resend's shared "onboarding@resend.dev"
 * address, which works immediately with no domain setup — for a real
 * launch, verify your own domain in Resend and set RESEND_FROM_EMAIL to
 * an address on it (e.g. "reservations@yourdomain.com").
 */

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
}

export async function sendReservationConfirmation(params: {
  guestEmail: string;
  guestName: string;
  confirmationCode: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPriceUsd: number;
  hotelName: string;
  hotelEmail: string;
  hotelPhone: string;
}): Promise<{ sent: boolean; error?: string }> {
  const client = getClient();
  if (!client) {
    console.log(`[email] Skipped guest confirmation for ${params.guestEmail} — RESEND_API_KEY not set.`);
    return { sent: false, error: "RESEND_API_KEY not set" };
  }

  try {
    const result = await client.emails.send({
      from: `${params.hotelName} <${fromAddress()}>`,
      to: params.guestEmail,
      subject: `Your reservation is confirmed — ${params.confirmationCode}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #2f2a26;">
          <h1 style="font-size: 20px; letter-spacing: 0.05em; text-transform: uppercase;">${params.hotelName}</h1>
          <p>Dear ${params.guestName},</p>
          <p>Your reservation is held. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 6px 0; color: #6b6560;">Confirmation</td><td style="padding: 6px 0; text-align: right;"><strong>${params.confirmationCode}</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #6b6560;">Room</td><td style="padding: 6px 0; text-align: right;">${params.roomName}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b6560;">Check-in</td><td style="padding: 6px 0; text-align: right;">${params.checkIn}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b6560;">Check-out</td><td style="padding: 6px 0; text-align: right;">${params.checkOut}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b6560;">Guests</td><td style="padding: 6px 0; text-align: right;">${params.guests}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b6560;">Total</td><td style="padding: 6px 0; text-align: right;"><strong>$${params.totalPriceUsd.toLocaleString()}</strong></td></tr>
          </table>
          <p>Questions? Reply to this email or call ${params.hotelPhone}.</p>
          <p style="margin-top: 24px; color: #6b6560; font-size: 13px;">— The ${params.hotelName} team</p>
        </div>
      `,
    });
    if (result.error) {
      console.error("[email] Resend returned an error for guest confirmation:", result.error);
      return { sent: false, error: result.error.message };
    }
    return { sent: true };
  } catch (err) {
    // Never let an email failure break the booking itself — it already
    // succeeded and was saved before this is called.
    console.error("[email] Failed to send guest confirmation:", err);
    return { sent: false, error: err instanceof Error ? err.message : "Unknown error." };
  }
}

export async function sendStaffNotification(params: {
  hotelEmail: string;
  subject: string;
  text: string;
}): Promise<{ sent: boolean; error?: string }> {
  const client = getClient();
  if (!client) {
    console.log(`[email] Skipped staff notification "${params.subject}" — RESEND_API_KEY not set.`);
    return { sent: false, error: "RESEND_API_KEY not set" };
  }

  try {
    const result = await client.emails.send({
      from: `Site Notifications <${fromAddress()}>`,
      to: params.hotelEmail,
      subject: params.subject,
      text: params.text,
    });
    if (result.error) {
      console.error("[email] Resend returned an error for staff notification:", result.error);
      return { sent: false, error: result.error.message };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] Failed to send staff notification:", err);
    return { sent: false, error: err instanceof Error ? err.message : "Unknown error." };
  }
}
