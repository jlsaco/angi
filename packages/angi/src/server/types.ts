import type {
  ComponentPayload,
  AngiStreamChunk,
  AngiToolDefinition,
} from "../shared/types";

export interface AngiServerAdapter {
  run(
    prompt: string,
    components: ComponentPayload[],
    tools: AngiToolDefinition[],
    systemPrompt: string
  ): AsyncIterable<AngiStreamChunk>;
}

export type AngiProvider = "anthropic" | "openai" | "gemini";

export interface AngiAgentConfig {
  /** API key for the chosen provider. */
  apiKey: string;

  /**
   * Which LLM provider to use.
   * Defaults to "anthropic" for backward compatibility.
   */
  provider?: AngiProvider;

  /** Override the default model for the chosen provider. */
  model?: string;

  /** Supply your own adapter instead of using a built-in provider. */
  adapter?: AngiServerAdapter;
}

export interface AngiResponse {
  text: string;
  actions: Array<{
    componentId: string;
    actionName: string;
    params: Record<string, unknown>;
  }>;
}
