"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const INACTIVITY_LIMIT_MS = 25 * 60 * 1000; // 25 minutes
const WARNING_BEFORE_MS = 60 * 1000; // warn 60s before logging out
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;

/**
 * Auto-logs out an inactive admin session client-side, on top of the
 * session cookie's own 8-hour absolute expiry (see admin-auth.ts) — that
 * one covers "how long can a session exist at all," this one covers
 * "did anyone actually walk away from an unlocked admin dashboard."
 * Shows a warning with a countdown before it happens, so an idle-but-
 * present staff member gets a chance to stay signed in.
 */
export function SessionTimeout() {
  const router = useRouter();
  const [warning, setWarning] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(60);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const logout = React.useCallback(async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }, [router]);

  const clearTimers = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const resetTimer = React.useCallback(() => {
    clearTimers();
    setWarning(false);
    setSecondsLeft(Math.round(WARNING_BEFORE_MS / 1000));

    warningTimeoutRef.current = setTimeout(() => {
      setWarning(true);
      let remaining = Math.round(WARNING_BEFORE_MS / 1000);
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setSecondsLeft(remaining);
        if (remaining <= 0 && countdownRef.current) clearInterval(countdownRef.current);
      }, 1000);
    }, INACTIVITY_LIMIT_MS - WARNING_BEFORE_MS);

    timeoutRef.current = setTimeout(logout, INACTIVITY_LIMIT_MS);
  }, [clearTimers, logout]);

  React.useEffect(() => {
    resetTimer();
    function onActivity() {
      // Once the warning is showing, only the explicit "Stay signed in"
      // button resets it — otherwise a stray mouse jiggle near an
      // unattended desk would silently cancel the warning.
      setWarning((currentlyWarning) => {
        if (!currentlyWarning) resetTimer();
        return currentlyWarning;
      });
    }
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, onActivity));
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!warning) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-sm border border-stone-200 bg-white p-6 text-center dark:border-stone-700 dark:bg-conservatory-900">
        <Clock className="mx-auto h-8 w-8 text-bronze-400" />
        <h2 className="mt-3 font-display text-lg">Still there?</h2>
        <p className="mt-1 text-sm text-stone-500">
          You&apos;ll be signed out in <span className="font-mono font-medium">{secondsLeft}s</span> due to inactivity.
        </p>
        <Button type="button" variant="bronze" className="mt-4 w-full" onClick={resetTimer}>
          Stay signed in
        </Button>
      </div>
    </div>
  );
}
