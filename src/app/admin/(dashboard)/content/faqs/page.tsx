import { getSiteContent } from "@/lib/content-store";
import { FaqsEditor } from "@/components/admin/content/faqs-editor";

export default async function FaqsContentPage() {
  const { faqs } = await getSiteContent();
  return <FaqsEditor initial={faqs} />;
}
