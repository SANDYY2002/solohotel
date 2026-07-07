import { getSiteContent } from "@/lib/content-store";
import { SiteConfigEditor } from "@/components/admin/content/settings-editor";

export default async function SettingsPage() {
  const { siteConfig } = await getSiteContent();
  return <SiteConfigEditor initial={siteConfig} />;
}
