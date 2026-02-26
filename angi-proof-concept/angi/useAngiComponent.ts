"use client";

import { useEffect } from "react";
import { register, unregister } from "./registry";
import { useAngiComponentContext } from "./Angi";
import type { AngiAction } from "./types";

interface UseAngiComponentOptions {
  description: string;
  getState: () => unknown;
  actions?: Record<string, AngiAction>;
}

/**
 * Call this hook inside a component that is wrapped by <Angi.*>.
 * It registers the component in the global registry on mount
 * and unregisters it on unmount.
 *
 * Example:
 *   useAngiComponent({
 *     description: 'Contact form with name, email and department',
 *     getState: () => ({ name, email, selection }),
 *     actions: { fillField, resetForm },
 *   })
 */
export function useAngiComponent({
  description,
  getState,
  actions = {},
}: UseAngiComponentOptions) {
  const { id, permissions } = useAngiComponentContext();

  useEffect(() => {
    register({ id, description, permissions, getState, actions });
    return () => unregister(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Keep getState and actions fresh without re-registering
  useEffect(() => {
    register({ id, description, permissions, getState, actions });
  });
}
