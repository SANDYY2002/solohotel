import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { FeaturedRooms } from "@/components/home/featured-rooms";
import { Amenities } from "@/components/home/amenities";
import { RestaurantSection } from "@/components/home/restaurant-section";
import { SpaSection } from "@/components/home/spa-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { FaqSection } from "@/components/home/faq-section";
import { LocationMap } from "@/components/shared/location-map";
import { Reveal } from "@/components/shared/reveal";
import { getSiteContent } from "@/lib/content-store";
import { DEFAULT_CONTENT } from "@/lib/content-defaults";
import type { HomeSectionKey } from "@/lib/content-types";

// Maps each toggleable homepage section (see /admin/appearance) to its
// component. Hero and the location map are structural — they always render.
const HOME_SECTION_COMPONENTS: Record<HomeSectionKey, React.ComponentType> = {
  featuredRooms: FeaturedRooms,
  amenities: Amenities,
  dining: RestaurantSection,
  spa: SpaSection,
  testimonials: TestimonialsSection,
  gallery: GalleryPreview,
  faq: FaqSection,
};

// Reads live content from the database on every request — without this,
// Next.js would statically prerender this page at build time and never
// pick up admin edits made afterward.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { siteConfig } = await getSiteContent();
  return { title: `${siteConfig.name} — ${siteConfig.tagline}` };
}

export default async function HomePage() {
  const { appearance } = await getSiteContent();
  // Defensive fallback in case a pre-existing site was saved before this
  // field existed — see content-store.ts's default-merge for the normal path.
  const homeSections = appearance?.homeSections?.length
    ? appearance.homeSections
    : DEFAULT_CONTENT.appearance.homeSections;
  const visibleSections = homeSections.filter((section) => section.visible);

  return (
    <>
      <Hero />
      {visibleSections.map((section, index) => {
        const SectionComponent = HOME_SECTION_COMPONENTS[section.key];
        if (!SectionComponent) return null;
        // Extra top padding on whichever section renders first compensates
        // for the booking widget overlapping the hero.
        return index === 0 ? (
          <div key={section.key} className="pt-20 md:pt-28">
            <SectionComponent />
          </div>
        ) : (
          <SectionComponent key={section.key} />
        );
      })}
      <section className="container-hotel pb-24">
        <Reveal className="mb-10 text-center">
          <p className="eyebrow">Find us</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">On the Path of the Gods</h2>
        </Reveal>
        <LocationMap />
      </section>
    </>
  );
}
