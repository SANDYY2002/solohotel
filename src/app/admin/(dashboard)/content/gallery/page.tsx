import { getSiteContent } from "@/lib/content-store";
import { GalleryEditor } from "@/components/admin/content/gallery-editor";

// Always read the latest content from the database on every request.
export const dynamic = "force-dynamic";

export default async function GalleryContentPage() {
  const { gallery } = await getSiteContent();
  return <GalleryEditor initial={gallery} />;
}
