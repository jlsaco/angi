import type Anthropic from "@anthropic-ai/sdk";
import type { AngiServerAdapter } from "../types";
import type {
  ComponentPayload,
  AngiStreamChunk,
  AngiToolDefinition,
} from "../../shared/types";
import { parseToolName, parseToolParams } from "../core/parseToolName";

/**
 * Convert provider-agnostic AngiToolDefinition[] to Anthropic.Tool[].
 * The format is identical — Anthropic uses `input_schema` with JSON Schema.
 */
function toAnthropicTools(tools: AngiToolDefinition[]): Anthropic.Tool[] {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: {
      type: t.input_schema.type,
      properties: t.input_schema.properties,
      required: t.input_schema.required,
    },
  }));
}

export function createAnthropicServerAdapter(
  client: Anthropic,
  model?: string
): AngiServerAdapter {
  return {
    async *run(
      prompt: string,
      _components: ComponentPayload[],
      tools: AngiToolDefinition[],
      systemPrompt: string
    ): AsyncIterable<AngiStreamChunk> {
      const anthropicTools = toAnthropicTools(tools);

      const stream = await client.messages.stream({
        model: model ?? "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        tools: anthropicTools.length > 0 ? anthropicTools : undefined,
        messages: [{ role: "user", content: prompt }],
      });

      let pendingToolUses: Array<{
        id: string;
        name: string;
        inputJson: string;
      }> = [];
      let currentTool: {
        id: string;
        name: string;
        inputJson: string;
      } | null = null;

      for await (const event of stream) {
        if (event.type === "content_block_start") {
          if (event.content_block.type === "text") {
            // text block starting, nothing to do
          } else if (event.content_block.type === "tool_use") {
            currentTool = {
              id: event.content_block.id,
              name: event.content_block.name,
              inputJson: "",
            };
          }
        } else if (event.type === "content_block_delta") {
          if (event.delta.type === "text_delta") {
            yield { type: "text", text: event.delta.text };
          } else if (
            event.delta.type === "input_json_delta" &&
            currentTool
          ) {
            currentTool.inputJson += event.delta.partial_json;
          }
        } else if (event.type === "content_block_stop") {
          if (currentTool) {
            pendingToolUses.push(currentTool);
            currentTool = null;
          }
        } else if (event.type === "message_stop") {
          // Fire all collected tool uses
          for (const tool of pendingToolUses) {
            const { componentId, actionName } = parseToolName(tool.name);
            const params = parseToolParams(tool.inputJson);

            yield {
              type: "action",
              action: { componentId, actionName, params },
            };
          }
          pendingToolUses = [];
        }
      }
    },
  };
}
