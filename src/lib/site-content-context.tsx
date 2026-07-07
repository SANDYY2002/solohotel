"use client";

import * as React from "react";
import type { SiteContent } from "@/lib/content-types";

const SiteContentContext = React.createContext<SiteContent | null>(null);

export function SiteContentProvider({
  value,
  children,
}: {
  value: SiteContent;
  children: React.ReactNode;
}) {
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

/** Read the full, current site content from anywhere under `<SiteContentProvider>`. */
export function useSiteContent(): SiteContent {
  const ctx = React.useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContent() must be used within <SiteContentProvider>.");
  }
  return ctx;
}
