import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";
import { formatUSD } from "@/lib/utils";
import { Reveal } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";

const FALLBACK_ROOM_IMAGE = "/images/room-placeholder.jpg";

export async function FeaturedRooms() {
  const { rooms } = await getSiteContent();
  const featured = rooms.slice(0, 3);

  return (
    <section className="container-hotel py-24" aria-labelledby="featured-rooms-heading">
      <Reveal className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Where you&apos;ll stay</p>
          <h2 id="featured-rooms-heading" className="mt-3 max-w-lg font-display text-4xl md:text-5xl">
            Rooms built around the view
          </h2>
        </div>
        <Link href="/rooms" className="group flex items-center gap-1 text-sm font-medium text-bronze-500">
          View all rooms & suites
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-3">
        {featured.map((room, i) => (
          <Reveal key={room.slug} delay={i * 0.1}>
            <Link
              href={`/rooms#${room.slug}`}
              className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze-400"
              aria-label={`View details for ${room.name}, ${formatUSD(room.pricePerNight)} per night`}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                <Image
                  src={room.images[0] ?? FALLBACK_ROOM_IMAGE}
                  alt={room.name}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-700 ease-signature group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute left-3 top-3">
                  <Badge variant="soft">{room.category}</Badge>
                </div>
              </div>
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl">{room.name}</h3>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{room.view}</p>
                </div>
                <p className="whitespace-nowrap text-right font-mono text-sm text-bronze-500">
                  {formatUSD(room.pricePerNight)}
                  <span className="text-stone-400">/night</span>
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}