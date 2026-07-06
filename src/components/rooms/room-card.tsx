"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Room } from "@/data/rooms";
import { formatUSD } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

export function RoomCard({ room, reversed = false }: { room: Room; reversed?: boolean }) {
  const [imgIndex, setImgIndex] = React.useState(0);

  return (
    <Reveal id={room.slug} className="scroll-mt-28">
      <div className={`grid gap-8 rounded-sm border border-stone-200/70 p-2 dark:border-stone-800 md:grid-cols-2 md:gap-10 md:p-3 ${reversed ? "md:[&>*:first-child]:order-2" : ""}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
          <Image
            src={room.images[imgIndex]!}
            alt={`${room.name} — image ${imgIndex + 1} of ${room.images.length}`}
            fill
            loading="lazy"
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {room.images.length > 1 && (
            <>
              <button
                onClick={() => setImgIndex((i) => (i - 1 + room.images.length) % room.images.length)}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/40 text-stone-50 hover:bg-ink/60"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setImgIndex((i) => (i + 1) % room.images.length)}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/40 text-stone-50 hover:bg-ink/60"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {room.images.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Show photo ${i + 1}`}
                    onClick={() => setImgIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${i === imgIndex ? "w-5 bg-stone-50" : "w-1.5 bg-stone-50/50"}`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge variant="soft">{room.category}</Badge>
            {!room.available && <Badge variant="warn">Sold Out</Badge>}
            {room.available && room.unitsLeft <= 3 && <Badge variant="success">{room.unitsLeft} left</Badge>}
          </div>
        </div>

        <div className="flex flex-col p-4 md:p-6">
          <h3 className="font-display text-2xl md:text-3xl">{room.name}</h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {room.size} · {room.bedType} · Up to {room.maxGuests} guests · {room.view}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{room.description}</p>

          <ul className="mt-5 grid grid-cols-2 gap-y-2 text-sm text-stone-600 dark:text-stone-300">
            {room.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 flex-shrink-0 text-bronze-400" /> {f}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center justify-between pt-6">
            <p>
              <span className="font-display text-2xl text-bronze-500">{formatUSD(room.pricePerNight)}</span>
              <span className="text-sm text-stone-400"> / night</span>
            </p>
            <Button
              variant={room.available ? "bronze" : "outline"}
              disabled={!room.available}
              onClick={() => document.getElementById("booking-widget")?.scrollIntoView({ behavior: "smooth" })}
            >
              {room.available ? "Book Now" : "Join Waitlist"}
            </Button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
