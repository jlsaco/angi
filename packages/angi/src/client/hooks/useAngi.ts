"use client";

import { useAngiContext } from "../components/AngiProvider";

/**
 * Consumer hook — use this anywhere in your app to send a prompt to Angi.
 *
 * const { sendPrompt, isLoading, streamText } = useAngi()
 */
export function useAngi() {
  return useAngiContext();
}
