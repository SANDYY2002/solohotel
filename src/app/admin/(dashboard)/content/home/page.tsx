import { getSiteContent } from "@/lib/content-store";
import { HomeEditor } from "@/components/admin/content/home-editor";

// Always read the latest content from the database on every request.
export const dynamic = "force-dynamic";

export default async function HomeContentPage() {
  const { home } = await getSiteContent();
  return <HomeEditor initial={home} />;
}
