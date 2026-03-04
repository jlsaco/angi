"use client";

import { AngiProvider } from "../components/AngiProvider";
import { createAngiAdapter } from "../adapters/anthropic";
import { useMemo } from "react";

/**
 * AngiNextProvider — drop-in provider for Next.js App Router.
 * Wraps AngiProvider with a client boundary and instantiates the adapter.
 *
 * Usage in layout.tsx:
 *   import { AngiNextProvider } from "@angi-ai/angi/client"
 *   <AngiNextProvider>{children}</AngiNextProvider>
 */
export function AngiNextProvider({
  endpoint,
  children,
}: {
  endpoint?: string;
  children: React.ReactNode;
}) {
  const adapter = useMemo(() => createAngiAdapter(endpoint), [endpoint]);
  return <AngiProvider adapter={adapter}>{children}</AngiProvider>;
}
