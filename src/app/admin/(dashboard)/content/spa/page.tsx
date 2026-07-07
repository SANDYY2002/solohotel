import { getSiteContent } from "@/lib/content-store";
import { SpaEditor } from "@/components/admin/content/spa-editor";

// Always read the latest content from the database on every request.
export const dynamic = "force-dynamic";

export default async function SpaContentPage() {
  const { spa } = await getSiteContent();
  return <SpaEditor initial={spa} />;
}
