"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/lib/site-content-context";

export default function AdminLoginPage() {
  const { siteConfig } = useSiteContent();
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        return;
      }
      const from = params.get("from") ?? "/admin";
      router.push(from);
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6 dark:bg-conservatory-950">
      <div className="glass-panel w-full max-w-sm rounded-md p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Lock className="h-6 w-6 text-bronze-400" />
          <p className="mt-3 font-display text-xl uppercase tracking-widest2">{siteConfig.name}</p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Staff Admin</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
          <Button type="submit" variant="bronze" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
