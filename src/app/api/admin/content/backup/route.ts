import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSiteContent, replaceSiteContent } from "@/lib/content-store";
import { CONTENT_SECTIONS } from "@/lib/content-types";
import { logActivity } from "@/lib/activity-log";

/** GET returns the full site content, for download as a backup file. */
export async function GET(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const content = await getSiteContent();
  return NextResponse.json(content);
}

/** POST replaces the full site content — used to restore from a backup file. */
export async function POST(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "That file isn't valid JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid backup file." }, { status: 400 });
  }

  const missing = CONTENT_SECTIONS.filter((s) => !(s in (body as Record<string, unknown>)));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Backup file is missing: ${missing.join(", ")}. Make sure this file came from this site's "Download backup" button.` },
      { status: 400 }
    );
  }

  const restored = await replaceSiteContent(body as never);
  await logActivity({
    action: "content_restored",
    entity: "content",
    summary: "Restored all site content from a backup file",
  });

  return NextResponse.json(restored);
}
