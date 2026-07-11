import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSiteContent, updateSiteContentSection } from "@/lib/content-store";
import { CONTENT_SECTIONS, type ContentSection } from "@/lib/content-types";
import { logActivity } from "@/lib/activity-log";

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const content = await getSiteContent();
  return NextResponse.json(content);
}

export async function PUT(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { section, data } = (body ?? {}) as { section?: string; data?: unknown };

  if (typeof section !== "string" || !CONTENT_SECTIONS.includes(section as ContentSection)) {
    return NextResponse.json(
      { error: `"section" must be one of: ${CONTENT_SECTIONS.join(", ")}` },
      { status: 400 }
    );
  }
  if (data === undefined) {
    return NextResponse.json({ error: '"data" is required.' }, { status: 400 });
  }

  const updated = await updateSiteContentSection(section as ContentSection, data as never);
  await logActivity({
    action: "content_saved",
    entity: "content",
    entityId: section,
    summary: `Saved changes to "${section}" content`,
  });
  return NextResponse.json(updated);
}
