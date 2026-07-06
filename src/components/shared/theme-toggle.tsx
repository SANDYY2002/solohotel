"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <div className={cn("h-9 w-9", className)} aria-hidden />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full border border-current/15 transition-colors hover:bg-current/5",
        className
      )}
    >
      <Sun className={cn("absolute h-4 w-4 transition-all duration-300", isDark ? "scale-0 opacity-0" : "scale-100 opacity-100")} />
      <Moon className={cn("absolute h-4 w-4 transition-all duration-300", isDark ? "scale-100 opacity-100" : "scale-0 opacity-0")} />
    </button>
  );
}
