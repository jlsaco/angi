import type { AngiComponentDefinition } from "../types";

// Module-level singleton — survives re-renders, shared across the whole app.
const registry = new Map<string, AngiComponentDefinition>();

export function register(def: AngiComponentDefinition): void {
  const existing = registry.get(def.id);
  
  // A collision happens if a DIFFERENT component instance (different instanceId)
  // tries to register with an ID that is already taken. 
  // (We ignore re-renders of the same component instance, which share the same instanceId).
  if (
    process.env.NODE_ENV === "development" &&
    existing &&
    existing.instanceId !== def.instanceId
  ) {
    throw new Error(
      `[Angi] ❌ Duplicate component id detected: "${def.id}". ` +
      `Two different component instances are trying to use the same id. ` +
      `This will cause silent failures in AI interaction. ` +
      `Fix this by providing a unique id via <Angi.Form id="..."> to one of the components.`
    );
  }
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
