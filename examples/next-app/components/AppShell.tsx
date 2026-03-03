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

  const adapter = useMemo(
    () => createAnthropicAdapter(`/api/angi?provider=${provider}`),
    [provider]
  );

  return (
    <ProviderContext.Provider value={{ provider, setProvider }}>
      <AngiProvider adapter={adapter}>
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-white">Angi</span>
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Contact Form
            </Link>
            <Link
              href="/blog"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Blog
            </Link>
          </div>
          <ProviderSwitcher />
        </nav>
        <div className="pt-14">{children}</div>
        <AngiChatBubble />
      </AngiProvider>
    </ProviderContext.Provider>
  );
}
