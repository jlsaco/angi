import type { Anthropic } from "@anthropic-ai/sdk";
import type { ComponentPayload, AngiStreamChunk } from "../shared/types";

export interface AngiServerAdapter {
  run(
    prompt: string,
    components: ComponentPayload[],
    tools: Anthropic.Tool[],
    systemPrompt: string
  ): AsyncIterable<AngiStreamChunk>;
}

export interface AngiAgentConfig {
  apiKey: string;
  model?: string;
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
