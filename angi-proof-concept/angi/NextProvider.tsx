"use client";

import { AngiProvider, createAnthropicAdapter } from "./index";
import { useMemo } from "react";

/**
 * AngiNextProvider — drop-in provider for Next.js App Router.
 * Wraps AngiProvider with a client boundary and instantiates the adapter.
 *
 * Usage in layout.tsx:
 *   import { AngiNextProvider } from "@/angi"
 *   <AngiNextProvider>{children}</AngiNextProvider>
 */
export function AngiNextProvider({ children }: { children: React.ReactNode }) {
  const adapter = useMemo(() => createAnthropicAdapter(), []);
  return <AngiProvider adapter={adapter}>{children}</AngiProvider>;
}
