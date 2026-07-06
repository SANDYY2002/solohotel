"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Consistent scroll-reveal used across sections instead of ad-hoc
 * animation props scattered per component. Respects reduced-motion
 * via framer-motion's automatic viewport + transition handling.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  id,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  id?: string;
}) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
