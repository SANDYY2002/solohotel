"use client";

import * as React from "react";
import { Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders a phone number that, when clicked, offers a choice between
 * placing a call and opening a WhatsApp chat — instead of just firing a
 * `tel:` link. Used anywhere the site shows a phone number (footer,
 * contact page, map card, etc.) so the behavior stays consistent.
 */
export function PhoneLink({
  phone,
  whatsapp,
  className,
  iconClassName,
  showIcon = true,
  align = "left",
}: {
  phone: string;
  whatsapp?: string;
  className?: string;
  iconClassName?: string;
  showIcon?: boolean;
  align?: "left" | "right";
}) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const waDigits = (whatsapp || phone).replace(/[^\d]/g, "");
  const waHref = `https://wa.me/${waDigits}`;

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn("inline-flex items-center gap-2 text-left", className)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {showIcon && <Phone className={cn("h-4 w-4 flex-shrink-0", iconClassName)} aria-hidden />}
        <span>{phone}</span>
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-full z-30 mt-2 w-48 overflow-hidden rounded-sm border border-stone-200 bg-white shadow-glass-lg dark:border-stone-700 dark:bg-conservatory-900",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <a
            href={telHref}
            role="menuitem"
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            <Phone className="h-4 w-4 text-bronze-400" aria-hidden /> Call
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className="flex items-center gap-2.5 border-t border-stone-100 px-4 py-3 text-sm text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-800 dark:text-stone-200 dark:hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            <MessageCircle className="h-4 w-4 text-bronze-400" aria-hidden /> WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
