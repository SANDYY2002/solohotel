import { getSiteContent } from "@/lib/content-store";
import { DiningEditor } from "@/components/admin/content/dining-editor";

export default async function DiningContentPage() {
  const { dining } = await getSiteContent();
  return <DiningEditor initial={dining} />;
}
