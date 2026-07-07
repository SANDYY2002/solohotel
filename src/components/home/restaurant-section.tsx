import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";

export async function RestaurantSection() {
  const { dining } = await getSiteContent();
  const venue = dining.venues[0];
  if (!venue) return null;
  return (
    <section className="container-hotel grid gap-10 py-24 md:grid-cols-2 md:items-center" aria-labelledby="dining-heading">
      <Reveal className="relative aspect-[4/5] overflow-hidden rounded-sm md:order-2">
        <Image
          src={venue.image}
          alt={venue.name}
          fill
          loading="lazy"
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </Reveal>
      <Reveal className="md:order-1">
        <p className="eyebrow">Dining</p>
        <h2 id="dining-heading" className="mt-3 font-display text-4xl md:text-5xl">
          {venue.name}
        </h2>
        <p className="mt-2 text-sm font-medium text-bronze-500">{venue.tagline}</p>
        <p className="mt-5 max-w-md text-stone-600 dark:text-stone-400">{venue.description}</p>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest2 text-stone-500">{venue.hours}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dining">
            <Button variant="primary">Explore Dining</Button>
          </Link>
          <Link href="/dining">
            <Button variant="outline" className="group">
              Reserve a Table{" "}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Button>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}