import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { RoomsBrowser } from "@/components/rooms/rooms-browser";

// Reads live content from the database on every request — without this,
// Next.js would statically prerender this page at build time and never
// pick up admin edits made afterward.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rooms & Suites",
  description: "Garden Rooms, Cliffside View Rooms, the Belvedere Suite, and the Grotto Villa — four ways to stay at Solterra Cliff House.",
};

export default function RoomsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Rooms & Suites"
        title="Four ways to wake up above the sea"
        description="Every category is built around a different relationship to the view — from garden-level terraces to a stand-alone villa with its own cove."
        image="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000&auto=format&fit=crop"
      />
      <div className="container-hotel py-20">
        <RoomsBrowser />
      </div>
    </>
  );
}
