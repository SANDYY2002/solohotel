import { getSiteContent } from "@/lib/content-store";
import { GalleryEditor } from "@/components/admin/content/gallery-editor";

export default async function GalleryContentPage() {
  const { gallery } = await getSiteContent();
  return <GalleryEditor initial={gallery} />;
}
