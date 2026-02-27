"use client";

import { useEffect, useId } from "react";
import { register, unregister } from "../core/registry";
import { useAngiComponentContext } from "../components/Angi";
import { stableHash } from "../core/utils/hash";
import type { AngiAction } from "../types";

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
 * ID resolution (hybrid strategy):
 *   1. If <Angi.Form id="..."> provides an explicit id → use it.
 *   2. If no id is given → derive a stable id from hash(description).
 *      Two components with the same description will collide — provide an
 *      explicit id to disambiguate them.
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
  const { id: explicitId, permissions } = useAngiComponentContext();
  const instanceId = useId();

  // Hybrid ID: explicit > hash(description)
  const id = explicitId ?? stableHash(description);

  useEffect(() => {
    register({ id, instanceId, description, permissions, getState, actions });
    return () => unregister(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, instanceId]);

  // Keep getState and actions fresh without re-registering
  useEffect(() => {
    register({ id, instanceId, description, permissions, getState, actions });
  });
}
