"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Check, Loader2 } from "lucide-react";

/**
 * Concierge message widget. This isn't real-time chat (that needs a proper
 * backend — Intercom, Crisp, a websocket service, etc.) — it's an honest
 * "leave a message" form dressed as one, saved through the same contact
 * pipeline staff already monitor in /admin/contacts. Previously this
 * accepted a message, showed "Online," and silently discarded everything.
 */
export function LiveChat() {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Concierge chat guest", email, subject: "Concierge chat message", message }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

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
            aria-label="Concierge message"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-sm uppercase tracking-widest2 text-conservatory-900 dark:text-stone-100">
                Concierge
              </p>
              <span className="text-[11px] text-conservatory-600 dark:text-conservatory-300">Replies within a few hours</span>
            </div>

            {status === "sent" ? (
              <div className="flex items-center gap-2 rounded-sm bg-white/60 p-3 text-sm text-stone-600 dark:bg-stone-900/40 dark:text-stone-300">
                <Check className="h-4 w-4 flex-shrink-0 text-bronze-400" />
                Sent — our concierge team will reply by email.
              </div>
            ) : (
              <>
                <div className="mb-3 rounded-sm bg-white/60 p-3 text-sm text-stone-600 dark:bg-stone-900/40 dark:text-stone-300">
                  Leave a message about bookings, dining, or transfers, and we&apos;ll follow up by email.
                </div>
                <form className="space-y-2" onSubmit={handleSubmit}>
                  <input
                    type="email"
                    required
                    placeholder="Your email"
                    aria-label="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-full rounded-sm border border-stone-300 bg-white/70 px-3 text-sm dark:border-stone-700 dark:bg-stone-900/50"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Type a message…"
                      aria-label="Message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="h-10 flex-1 rounded-sm border border-stone-300 bg-white/70 px-3 text-sm dark:border-stone-700 dark:bg-stone-900/50"
                    />
                    <button
                      type="submit"
                      aria-label="Send"
                      disabled={status === "sending"}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm bg-bronze-400 text-ink hover:bg-bronze-300 disabled:opacity-60"
                    >
                      {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                  {status === "error" && <p className="text-xs text-red-400">Couldn&apos;t send that — please try again.</p>}
                </form>
              </>
            )}
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
