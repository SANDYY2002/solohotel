import { getSiteContent } from "@/lib/content-store";
import { SpaEditor } from "@/components/admin/content/spa-editor";

export default async function SpaContentPage() {
  const { spa } = await getSiteContent();
  return <SpaEditor initial={spa} />;
}
