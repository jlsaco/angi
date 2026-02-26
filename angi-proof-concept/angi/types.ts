// ─────────────────────────────────────────────
// Angi Core Types
// ─────────────────────────────────────────────

export type AngiPermission = "read" | "write";

/**
 * A single action that the LLM can call on a registered component.
 */
export interface AngiAction {
  description: string;
  /** Simple schema describing expected params: { field: "string", value: "string" } */
  schema: Record<string, string>;
  execute: (params: Record<string, unknown>) => void;
}

/**
 * The full definition of a registered Angi component.
 * Stored in the registry after `useAngiComponent` mounts.
 */
export interface AngiComponentDefinition {
  id: string;
  description: string;
  permissions: AngiPermission[];
  getState: () => unknown;
  actions: Record<string, AngiAction>;
}

/**
 * A single chunk yielded by an adapter during streaming.
 */
export type AngiStreamChunk =
  | { type: "text"; text: string }
  | {
      type: "action";
      action: {
        componentId: string;
        actionName: string;
        params: Record<string, unknown>;
      };
    };

/**
 * The adapter interface — any LLM integration must implement this.
 */
export interface AngiAdapter {
  run(
    prompt: string,
    components: AngiComponentDefinition[]
  ): AsyncIterable<AngiStreamChunk>;
}

/** Context value shape exposed by AngiProvider */
export interface AngiContextValue {
  sendPrompt: (prompt: string) => Promise<void>;
  isLoading: boolean;
  streamText: string;
}

/** Shape passed down from an Angi.* wrapper to its children via context */
export interface AngiComponentContextValue {
  id: string;
  permissions: AngiPermission[];
}
