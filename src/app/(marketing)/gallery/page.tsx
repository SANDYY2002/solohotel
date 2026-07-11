import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { MasonryGallery } from "@/components/gallery/masonry-gallery";

// Reads live content from the database on every request — without this,
// Next.js would statically prerender this page at build time and never
// pick up admin edits made afterward.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Rooms, dining, spa, grounds, and coastline — a visual tour of Yukin Cliff House.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="A closer look at Yukin"
        description="Rooms, dining, spa, grounds, and the coastline itself — browse by category or take it all in."
        image="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2000&auto=format&fit=crop"
      />
      <div className="container-hotel py-20">
        <MasonryGallery />
      </div>
    </>
  );
}
