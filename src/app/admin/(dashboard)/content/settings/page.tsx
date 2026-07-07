import { getSiteContent } from "@/lib/content-store";
import { SiteConfigEditor } from "@/components/admin/content/settings-editor";

// Always read the latest content from the database on every request.
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { siteConfig } = await getSiteContent();
  return <SiteConfigEditor initial={siteConfig} />;
}
