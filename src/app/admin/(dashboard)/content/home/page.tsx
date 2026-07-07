import { getSiteContent } from "@/lib/content-store";
import { HomeEditor } from "@/components/admin/content/home-editor";

export default async function HomeContentPage() {
  const { home } = await getSiteContent();
  return <HomeEditor initial={home} />;
}
