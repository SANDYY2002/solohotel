import { getSiteContent } from "@/lib/content-store";
import { AboutEditor } from "@/components/admin/content/about-editor";

// Always read the latest content from the database on every request.
export const dynamic = "force-dynamic";

export default async function AboutContentPage() {
  const { about } = await getSiteContent();
  return <AboutEditor initial={about} />;
}
