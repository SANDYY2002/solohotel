"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { testimonials } from "@/data/content";
import { Reveal } from "@/components/shared/reveal";

const AUTOPLAY_INTERVAL_MS = 6000;

export function TestimonialsSection() {
  const [index, setIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const reduceMotion = useReducedMotion();
  const active = testimonials[index];

  const go = React.useCallback((dir: 1 | -1) => {
    setIndex((i) => (i + dir + testimonials.length) % testimonials.length);
  }, []);

  // Autoplay: pauses on hover/focus and is skipped entirely for reduced-motion users.
  React.useEffect(() => {
    if (isPaused || reduceMotion || testimonials.length <= 1) return;
    const id = setInterval(() => go(1), AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPaused, reduceMotion, go]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  }

  if (!active) return null;

  return (
    <section className="container-hotel py-24" aria-labelledby="testimonials-heading">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">In their words</p>
        <h2 id="testimonials-heading" className="mt-3 font-display text-4xl md:text-5xl">
          Guests, not reviewers
        </h2>
      </Reveal>

      <div
        className="mx-auto mt-12 max-w-2xl text-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onKeyDown={handleKeyDown}
      >
        <div className="flex justify-center gap-1 text-bronze-400" aria-hidden>
          {Array.from({ length: active.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" />
          ))}
        </div>

        {/* aria-live announces the new quote to screen readers as the slide changes */}
        <div aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <p className="mt-6 text-balance font-display text-2xl leading-snug md:text-3xl">
                &ldquo;{active.quote}&rdquo;
              </p>
              <p className="mt-6 text-sm text-stone-500 dark:text-stone-400">
                {active.name} — {active.origin}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 transition-colors hover:bg-stone-900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze-400 dark:border-stone-700"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <div className="flex gap-1.5" role="tablist" aria-label="Testimonial selector">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                role="tab"
                aria-selected={i === index}
                aria-label={`Testimonial from ${t.name}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze-400 ${
                  i === index ? "w-6 bg-bronze-400" : "w-1.5 bg-stone-300 dark:bg-stone-700"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 transition-colors hover:bg-stone-900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze-400 dark:border-stone-700"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}