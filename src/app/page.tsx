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
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
};

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* Extra top padding compensates for the booking widget overlapping the hero */}
      <div className="pt-20 md:pt-28">
        <FeaturedRooms />
      </div>
      <Amenities />
      <RestaurantSection />
      <SpaSection />
      <TestimonialsSection />
      <GalleryPreview />
      <FaqSection />
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
