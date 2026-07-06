"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { galleryImages, type GalleryCategory } from "@/data/content";
import { cn } from "@/lib/utils";

const categories: (GalleryCategory | "All")[] = ["All", "Rooms", "Dining", "Spa", "Grounds", "Coastline"];

export function MasonryGallery() {
  const [filter, setFilter] = React.useState<(typeof categories)[number]>("All");
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  const filtered = React.useMemo(
    () => (filter === "All" ? galleryImages : galleryImages.filter((img) => img.category === filter)),
    [filter]
  );

  const close = React.useCallback(() => setLightboxIndex(null), []);
  const next = React.useCallback(() => setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length)), [filtered.length]);
  const prev = React.useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length)),
    [filtered.length]
  );

  React.useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, close, next, prev]);

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2" role="tablist" aria-label="Gallery categories">
        {categories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={filter === c}
            onClick={() => setFilter(c)}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-widest2 transition-colors",
              filter === c
                ? "border-bronze-400 bg-bronze-400 text-ink"
                : "border-stone-300 text-stone-600 hover:border-bronze-400 dark:border-stone-700 dark:text-stone-300"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* True masonry via CSS multi-column, rather than a fixed-row grid */}
      <div className="columns-2 gap-3 sm:columns-3 md:columns-4">
        {filtered.map((img, i) => (
          <button
            key={img.src + i}
            onClick={() => setLightboxIndex(i)}
            className="group relative mb-3 block w-full overflow-hidden rounded-sm break-inside-avoid"
            style={{ aspectRatio: `${img.w} / ${img.h}` }}
            aria-label={`Open image: ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-signature group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-conservatory-950/0 transition-colors group-hover:bg-conservatory-950/10" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
            onClick={close}
          >
            <button onClick={close} aria-label="Close" className="absolute right-5 top-5 text-stone-200 hover:text-bronze-300">
              <X className="h-7 w-7" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-200 hover:text-bronze-300 md:left-6"
            >
              <ChevronLeft className="h-9 w-9" />
            </button>
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-[75vh] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={filtered[lightboxIndex].src}
                alt={filtered[lightboxIndex].alt}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </motion.div>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-200 hover:text-bronze-300 md:right-6"
            >
              <ChevronRight className="h-9 w-9" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
