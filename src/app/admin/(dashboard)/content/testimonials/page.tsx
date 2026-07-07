import { getSiteContent } from "@/lib/content-store";
import { TestimonialsEditor } from "@/components/admin/content/testimonials-editor";

export default async function TestimonialsContentPage() {
  const { testimonials } = await getSiteContent();
  return <TestimonialsEditor initial={testimonials} />;
}
