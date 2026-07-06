"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

/**
 * Placeholder live-chat widget. Wire the onSubmit handler to your concierge
 * chat provider (e.g. Zendesk, Intercom, or an in-house socket) in production.
 */
export function LiveChat() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel mb-4 w-[320px] rounded-md p-4"
            role="dialog"
            aria-label="Concierge chat"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-sm uppercase tracking-widest2 text-conservatory-900 dark:text-stone-100">
                Concierge
              </p>
              <span className="flex items-center gap-1.5 text-[11px] text-conservatory-600 dark:text-conservatory-300">
                <span className="h-1.5 w-1.5 rounded-full bg-conservatory-500" /> Online
              </span>
            </div>
            <div className="mb-3 rounded-sm bg-white/60 p-3 text-sm text-stone-600 dark:bg-stone-900/40 dark:text-stone-300">
              Buonasera — I&apos;m here to help with bookings, dining reservations, or transfers. What can I do for you?
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                // In production: send message to concierge chat backend
              }}
            >
              <input
                type="text"
                placeholder="Type a message…"
                aria-label="Message"
                className="h-10 flex-1 rounded-sm border border-stone-300 bg-white/70 px-3 text-sm dark:border-stone-700 dark:bg-stone-900/50"
              />
              <button
                type="submit"
                aria-label="Send"
                className="flex h-10 w-10 items-center justify-center rounded-sm bg-bronze-400 text-ink hover:bg-bronze-300"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open concierge chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-conservatory-900 text-stone-50 shadow-glass-lg transition-transform hover:scale-105 dark:bg-bronze-400 dark:text-ink"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
