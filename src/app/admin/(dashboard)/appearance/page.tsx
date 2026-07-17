import { getSiteContent } from "@/lib/content-store";
import { AppearanceEditor } from "@/components/admin/content/appearance-editor";

// Always read the latest content from the database on every request.
export const dynamic = "force-dynamic";

export default async function AppearancePage() {
  const { appearance } = await getSiteContent();
  return <AppearanceEditor initial={appearance} />;
}
