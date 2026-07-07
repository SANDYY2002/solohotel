"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useSiteContent } from "@/lib/site-content-context";
import { BookingWidget } from "@/components/booking/booking-widget";

export function Hero() {
  const { siteConfig, home } = useSiteContent();
  const reduceMotion = useReducedMotion();

  function scrollToContent() {
    document.getElementById("hero-end")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  return (
    <section className="relative flex min-h-[100vh] w-full flex-col justify-end">
      <Image
        src={home.heroImage}
        alt={`Solterra Cliff House at golden hour, overlooking ${siteConfig.location}`}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-conservatory-950 via-conservatory-950/40 to-conservatory-950/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-conservatory-950/50 via-transparent to-transparent" />

      <div className="container-hotel relative z-10 pb-16 pt-40 text-stone-50">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="eyebrow text-bronze-200"
        >
          {siteConfig.location}
        </motion.p>
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 max-w-2xl text-balance font-display text-5xl leading-[1.05] md:text-7xl"
        >
          {siteConfig.tagline}
        </motion.h1>
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-md text-base leading-relaxed text-stone-200"
        >
          {siteConfig.description}
        </motion.p>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="container-hotel relative z-10 -mb-10 md:-mb-14"
      >
        <BookingWidget />
      </motion.div>

      <motion.button
        type="button"
        onClick={scrollToContent}
        animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full p-2 text-stone-200 transition-colors hover:text-bronze-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze-300 md:hidden"
        aria-label="Scroll to booking details"
      >
        <ChevronDown className="h-5 w-5" aria-hidden />
      </motion.button>

      {/* Scroll anchor so the indicator button has a real destination */}
      <span id="hero-end" className="absolute bottom-0" aria-hidden />
    </section>
  );
}