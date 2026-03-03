"use client";

import { createContext, useContext } from "react";

export type Provider = "anthropic" | "openai" | "gemini";

export interface ProviderContextValue {
  provider: Provider;
  setProvider: (p: Provider) => void;
}

export const ProviderContext = createContext<ProviderContextValue>({
  provider: "anthropic",
  setProvider: () => {},
});

export function useProvider() {
  return useContext(ProviderContext);
}
