"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import type { AngiAdapter, AngiContextValue, AngiStreamChunk } from "../types";
import { getSnapshot } from "../core/registry";

const AngiContext = createContext<AngiContextValue | null>(null);

export function useAngiContext(): AngiContextValue {
  const ctx = useContext(AngiContext);
  if (!ctx) throw new Error("useAngi must be used inside <AngiProvider>");
  return ctx;
}

interface AngiProviderProps {
  adapter: AngiAdapter;
  children: React.ReactNode;
}

export function AngiProvider({ adapter, children }: AngiProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const sendPrompt = useCallback(
    async (prompt: string) => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      setStreamText("");

      const components = getSnapshot();

      try {
        const stream = adapter.run(prompt, components);

        for await (const chunk of stream) {
          handleChunk(chunk, components, setStreamText);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setStreamText("⚠️ Something went wrong. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [adapter]
  );

  return (
    <AngiContext.Provider value={{ sendPrompt, isLoading, streamText }}>
      {children}
    </AngiContext.Provider>
  );
}

function handleChunk(
  chunk: AngiStreamChunk,
  components: ReturnType<typeof getSnapshot>,
  setStreamText: React.Dispatch<React.SetStateAction<string>>
) {
  if (chunk.type === "text") {
    setStreamText((prev) => prev + chunk.text);
    return;
  }

  if (chunk.type === "action") {
    const { componentId, actionName, params } = chunk.action;
    const component = components.find((c) => c.id === componentId);

    if (!component) {
      console.warn(`[Angi] Component "${componentId}" not found in registry.`);
      return;
    }

    if (!component.permissions.includes("write")) {
      console.warn(`[Angi] Component "${componentId}" does not allow write.`);
      return;
    }

    const action = component.actions[actionName];
    if (!action) {
      console.warn(
        `[Angi] Action "${actionName}" not found in component "${componentId}".`
      );
      return;
    }

    try {
      action.execute(params);
    } catch (e) {
      console.error(`[Angi] Error executing action "${actionName}":`, e);
    }
  }
}
