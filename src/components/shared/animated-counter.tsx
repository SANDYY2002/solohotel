"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  label,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1800, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, motionVal, value]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-4xl md:text-5xl text-bronze-400">
        {prefix}
        <motion.span>{display}</motion.span>
        {suffix}
      </p>
      <p className="mt-2 text-xs font-mono uppercase tracking-widest2 text-stone-500 dark:text-stone-400">{label}</p>
    </div>
  );
}
