import type { AngiComponentDefinition } from "./types";

// Module-level singleton — survives re-renders, shared across the whole app.
const registry = new Map<string, AngiComponentDefinition>();

export function register(def: AngiComponentDefinition): void {
  registry.set(def.id, def);
}

export function unregister(id: string): void {
  registry.delete(id);
}

export function getSnapshot(): AngiComponentDefinition[] {
  return Array.from(registry.values());
}

export function getById(id: string): AngiComponentDefinition | undefined {
  return registry.get(id);
}
