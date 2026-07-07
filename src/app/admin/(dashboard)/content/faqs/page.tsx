import { getSiteContent } from "@/lib/content-store";
import { FaqsEditor } from "@/components/admin/content/faqs-editor";

// Always read the latest content from the database on every request.
export const dynamic = "force-dynamic";

export default async function FaqsContentPage() {
  const { faqs } = await getSiteContent();
  return <FaqsEditor initial={faqs} />;
}
