import { getSiteContent } from "@/lib/content-store";
import { RoomsEditor } from "@/components/admin/content/rooms-editor";

// Always read the latest content from the database on every request.
export const dynamic = "force-dynamic";

export default async function RoomsContentPage() {
  const { rooms } = await getSiteContent();
  return <RoomsEditor initial={rooms} />;
}
