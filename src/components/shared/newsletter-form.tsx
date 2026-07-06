"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitted">("idle");
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    // In production: POST to /api/newsletter
    setStatus("submitted");
  }

  if (status === "submitted") {
    return (
      <p className={cn("flex items-center gap-2 text-sm", dark ? "text-bronze-300" : "text-conservatory-700")}>
        <Check className="h-4 w-4" /> You&apos;re on the list — welcome.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
          aria-invalid={!!error}
          className={dark ? "border-white/20 bg-white/5 text-stone-100 placeholder:text-stone-500" : ""}
        />
        <button
          type="submit"
          aria-label="Subscribe"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-sm bg-bronze-400 text-ink transition-colors hover:bg-bronze-300"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
