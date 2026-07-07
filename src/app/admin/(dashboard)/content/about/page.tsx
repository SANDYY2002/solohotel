import { getSiteContent } from "@/lib/content-store";
import { AboutEditor } from "@/components/admin/content/about-editor";

export default async function AboutContentPage() {
  const { about } = await getSiteContent();
  return <AboutEditor initial={about} />;
}
