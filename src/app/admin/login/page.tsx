"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2, UserPlus } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/lib/site-content-context";

export default function AdminLoginPage() {
  const { siteConfig } = useSiteContent();
  const router = useRouter();
  const params = useSearchParams();

  const [checkingSetup, setCheckingSetup] = React.useState(true);
  const [needsSetup, setNeedsSetup] = React.useState(false);

  // Normal login fields
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Bootstrap (first account) fields
  const [setupKey, setSetupKey] = React.useState("");
  const [name, setName] = React.useState("");
  const [setupEmail, setSetupEmail] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((data) => setNeedsSetup(!!data.needsSetup))
      .catch(() => setNeedsSetup(false))
      .finally(() => setCheckingSetup(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = needsSetup
        ? { setupKey, name, email: setupEmail, newPassword }
        : { email, password };
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  if (checkingSetup) {
    return <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-conservatory-950" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6 dark:bg-conservatory-950">
      <div className="glass-panel w-full max-w-sm rounded-md p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          {needsSetup ? <UserPlus className="h-6 w-6 text-bronze-400" /> : <Lock className="h-6 w-6 text-bronze-400" />}
          <p className="mt-3 font-display text-xl uppercase tracking-widest2">{siteConfig.name}</p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {needsSetup ? "Create the first admin account" : "Staff Admin"}
          </p>
        </div>

        {needsSetup ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="setupKey">Setup key</Label>
              <Input
                id="setupKey"
                type="password"
                autoFocus
                required
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                placeholder="Your current ADMIN_PASSWORD"
              />
              <p className="mt-1 text-xs text-stone-400">Proves you have access to this deployment&apos;s environment variables.</p>
            </div>
            <div>
              <Label htmlFor="name">Your name</Label>
              <Input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="setupEmail">Your email</Label>
              <Input id="setupEmail" type="email" required value={setupEmail} onChange={(e) => setSetupEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="newPassword">Choose a password</Label>
              <Input
                id="newPassword"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="mt-1 text-xs text-stone-400">At least 8 characters.</p>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button type="submit" variant="bronze" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Creating…" : "Create account & sign in"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
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
        )}
      </div>
    </div>
  );
}
