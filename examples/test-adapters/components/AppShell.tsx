"use client";

import { useState, useMemo } from "react";
import {
  AngiProvider,
  createAnthropicAdapter,
  AngiChatBubble,
} from "@angi-ai/angi/client";
import { ProviderContext, type Provider } from "@/lib/providers";
import { ProviderSwitcher } from "./ProviderSwitcher";
import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<Provider>("anthropic");

  // createAnthropicAdapter is provider-agnostic on the client side —
  // it just calls the endpoint and parses SSE. The actual provider
  // logic is server-side. We pass provider as a query param.
  const adapter = useMemo(
    () => createAnthropicAdapter(`/api/angi?provider=${provider}`),
    [provider]
  );

  return (
    <ProviderContext.Provider value={{ provider, setProvider }}>
      <AngiProvider adapter={adapter}>
        <nav className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-gray-900">Angi Test</span>
            <Link
              href="/blog"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Blog
            </Link>
            <Link
              href="/form"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Form
            </Link>
          </div>
          <ProviderSwitcher />
        </nav>
        <main className="min-h-screen bg-gray-50">{children}</main>
        <AngiChatBubble />
      </AngiProvider>
    </ProviderContext.Provider>
  );
}
