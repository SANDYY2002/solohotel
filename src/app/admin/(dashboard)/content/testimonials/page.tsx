import { getSiteContent } from "@/lib/content-store";
import { TestimonialsEditor } from "@/components/admin/content/testimonials-editor";

// Always read the latest content from the database on every request.
export const dynamic = "force-dynamic";

export default async function TestimonialsContentPage() {
  const { testimonials } = await getSiteContent();
  return <TestimonialsEditor initial={testimonials} />;
}
