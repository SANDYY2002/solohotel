import { getSiteContent } from "@/lib/content-store";
import { RoomsEditor } from "@/components/admin/content/rooms-editor";

export default async function RoomsContentPage() {
  const { rooms } = await getSiteContent();
  return <RoomsEditor initial={rooms} />;
}
