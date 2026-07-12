import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content-store";
import { sendStaffNotification } from "@/lib/email";
import { logActivity } from "@/lib/activity-log";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, email, phone, subject, message } = (body ?? {}) as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const submission = await prisma.contactSubmission.create({
    data: {
      name: name.trim(),
      email: email.trim(),
      phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
      subject: typeof subject === "string" && subject.trim() ? subject.trim() : "General Inquiry",
      message: message.trim(),
    },
  });

  const { siteConfig } = await getSiteContent();
  const staffEmailResult = await sendStaffNotification({
    hotelEmail: siteConfig.email,
    subject: `New message: ${submission.subject}`,
    text: `${submission.name} (${submission.email}${submission.phone ? `, ${submission.phone}` : ""}) wrote:\n\n${submission.message}`,
  });

  if (!staffEmailResult.sent) {
    await logActivity({
      action: "email_failed",
      entity: "contact",
      entityId: submission.id,
      summary: `Staff notification for message from ${submission.name} did not send: ${staffEmailResult.error}`,
    });
  }

  return NextResponse.json({ id: submission.id }, { status: 201 });
}
