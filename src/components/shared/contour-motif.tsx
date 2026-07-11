"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A single-line topographic/leaf contour, drawn on scroll into view.
 * This is YUKIN's signature element: it stands in for the site's
 * generic hairline dividers everywhere a section break is needed, and
 * echoes the terraced cliff-garden the hotel is built into.
 */
export function ContourMotif({ className, flip = false }: { className?: string; flip?: boolean }) {
  const reduced = useReducedMotion();

  return (
    <svg
      viewBox="0 0 800 120"
      className={cn("w-full", flip && "-scale-y-100", className)}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M0 60 C 80 20, 140 100, 220 55 S 340 10, 420 60 S 540 105, 620 50 S 740 15, 800 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={reduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0.4 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}
