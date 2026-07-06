"use client";

import * as React from "react";
import { rooms, roomCategories } from "@/data/rooms";
import { RoomCard } from "@/components/rooms/room-card";
import { BookingWidget } from "@/components/booking/booking-widget";
import { cn } from "@/lib/utils";

export function RoomsBrowser() {
  const [category, setCategory] = React.useState<(typeof roomCategories)[number]>("All");

  const filtered = category === "All" ? rooms : rooms.filter((r) => r.category === category);

  return (
    <div>
      <div className="mb-12 flex flex-wrap gap-2" role="tablist" aria-label="Filter rooms by category">
        {roomCategories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-5 py-2 text-sm font-medium transition-colors",
              category === c
                ? "border-bronze-400 bg-bronze-400 text-ink"
                : "border-stone-300 text-stone-600 hover:border-bronze-400 dark:border-stone-700 dark:text-stone-300"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-16">
        {filtered.map((room, i) => (
          <RoomCard key={room.slug} room={room} reversed={i % 2 === 1} />
        ))}
      </div>

      <div className="mt-24 flex flex-col items-center gap-6 text-center">
        <div>
          <p className="eyebrow">Ready when you are</p>
          <h2 className="mt-2 font-display text-3xl">Check real-time availability</h2>
        </div>
        <BookingWidget />
      </div>
    </div>
  );
}
