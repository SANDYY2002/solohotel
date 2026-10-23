// Database-backed store for all admin-editable site content (settings,
// rooms, dining, spa, gallery, testimonials, FAQs, about).
//
// Everything lives in one row of the `SiteContent` table (see
// prisma/schema.prisma) as a single JSON blob, seeded from
// `DEFAULT_CONTENT` the first time it's read. It's a database table
// rather than a file on disk specifically so this works on serverless
// platforms like Vercel, where the filesystem is read-only at runtime —
// a JSON file written with `fs` would silently fail to persist there.
//
// The rest of the app never touches Prisma directly for this: pages call
// `getSiteContent()`, client components call `useSiteContent()`, and admin
// saves go through `updateSiteContentSection()`.

import { prisma } from "@/lib/prisma";
import type { SiteContent, ContentSection } from "@/lib/content-types";
import { DEFAULT_CONTENT } from "@/lib/content-defaults";

const SINGLETON_KEY = "site-content";

export { DEFAULT_CONTENT };

// Keep older database content branded consistently without changing saved
// contact addresses, image URLs, or external links.
function normalizeLegacyBrand<T>(value: T): T {
  if (typeof value === "string") {
    if (/^(?:https?:\/\/|mailto:|tel:|\/|data:)/i.test(value) || /\S+@\S+/.test(value)) return value;
    return value.replace(/\bSolterra\b/gi, "YUKIN") as T;
  }
  if (Array.isArray(value)) return value.map(normalizeLegacyBrand) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizeLegacyBrand(entry)])
    ) as T;
  }
  return value;
}


/** Reads the full content object, seeding the row with defaults on first run. */
export async function getSiteContent(): Promise<SiteContent> {
  const row = await prisma.siteContent.findUnique({ where: { key: SINGLETON_KEY } });

  if (!row) {
    await prisma.siteContent.upsert({
      where: { key: SINGLETON_KEY },
      update: {},
      create: { key: SINGLETON_KEY, data: DEFAULT_CONTENT as object },
    });
    return DEFAULT_CONTENT;
  }

  // Merge over defaults so new fields introduced by an app update (e.g. a
  // new section) show up even for content saved by an older version.
  return normalizeLegacyBrand({ ...DEFAULT_CONTENT, ...(row.data as Partial<SiteContent>) });
}

/** Replaces a single top-level section (e.g. "rooms", "siteConfig") and persists it. */
export async function updateSiteContentSection<K extends ContentSection>(
  section: K,
  data: SiteContent[K]
): Promise<SiteContent> {
  const current = await getSiteContent();
  const next: SiteContent = normalizeLegacyBrand({ ...current, [section]: data });

  await prisma.siteContent.upsert({
    where: { key: SINGLETON_KEY },
    update: { data: next as object },
    create: { key: SINGLETON_KEY, data: next as object },
  });

  return next;
}

/** Replaces the entire content object at once — used for restoring from a backup file. */
export async function replaceSiteContent(content: SiteContent): Promise<SiteContent> {
  const branded = normalizeLegacyBrand(content);
  await prisma.siteContent.upsert({
    where: { key: SINGLETON_KEY },
    update: { data: branded as object },
    create: { key: SINGLETON_KEY, data: branded as object },
  });
  return branded;
}
