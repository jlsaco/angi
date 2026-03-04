// ─────────────────────────────────────────────
// Angi Shared Types (Client & Server)
// ─────────────────────────────────────────────

/**
 * A single chunk yielded by the server during streaming.
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
 * Serialized representation of a component sent to the server.
 */
export interface ComponentPayload {
  id: string;
  description: string;
  permissions: string[];
  state?: unknown;
  actions: Record<
    string,
    { description: string; schema: Record<string, string> }
  >;
}

/**
 * Provider-agnostic tool definition produced by buildTools().
 * Each adapter converts this to its provider's native format internally.
 */
export interface AngiToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

/**
 * Expected request body for the AI endpoint.
 */
export interface AngiRequestBody {
  prompt: string;
  components: ComponentPayload[];
}
