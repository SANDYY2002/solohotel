"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSiteContent } from "@/lib/site-content-context";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { siteConfig } = useSiteContent();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-signature",
        scrolled || open
          ? "glass-panel border-b border-white/30 dark:border-stone-800/60"
          : "bg-transparent"
      )}
    >
      <nav className="container-hotel flex h-20 items-center justify-between" aria-label="Primary">
        <Link href="/" className="font-display text-xl tracking-widest2 uppercase" aria-label={`${siteConfig.name} home`}>
          <span className={cn(!scrolled && !open && "text-stone-50 md:text-stone-50")}>{siteConfig.name}</span>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {siteConfig.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-bronze-400",
                  pathname === item.href ? "text-bronze-400" : scrolled ? "text-stone-700 dark:text-stone-200" : "text-stone-50"
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/manage-booking"
            className={cn(
              "text-sm font-medium transition-colors hover:text-bronze-400",
              pathname === "/manage-booking" ? "text-bronze-400" : scrolled ? "text-stone-700 dark:text-stone-200" : "text-stone-50"
            )}
          >
            Manage Booking
          </Link>
          <ThemeToggle className={cn(!scrolled && "text-stone-50 border-white/30")} />
          <Button variant="bronze" size="sm" onClick={() => document.getElementById("booking-widget")?.scrollIntoView({ behavior: "smooth" })}>
            {siteConfig.bookingCta}
          </Button>
        </div>

        <button
          className={cn("lg:hidden", scrolled || open ? "text-stone-800 dark:text-stone-100" : "text-stone-50")}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/30 bg-stone-50/95 dark:border-stone-800 dark:bg-conservatory-950/95 lg:hidden"
          >
            <ul className="container-hotel flex flex-col gap-1 py-4">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-3 text-base font-medium text-stone-800 dark:text-stone-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/manage-booking" className="block py-3 text-base font-medium text-stone-800 dark:text-stone-100">
                  Manage Booking
                </Link>
              </li>
              <li className="flex items-center justify-between pt-3">
                <ThemeToggle />
                <Button
                  variant="bronze"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    document.getElementById("booking-widget")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {siteConfig.bookingCta}
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
