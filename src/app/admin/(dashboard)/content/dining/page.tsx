import { getSiteContent } from "@/lib/content-store";
import { DiningEditor } from "@/components/admin/content/dining-editor";

// Always read the latest content from the database on every request.
export const dynamic = "force-dynamic";

export default async function DiningContentPage() {
  const { dining } = await getSiteContent();
  return <DiningEditor initial={dining} />;
}
