import Anthropic from "@anthropic-ai/sdk";
import type { AngiServerAdapter } from "../types";
import type { ComponentPayload, AngiStreamChunk } from "../../shared/types";

export function createAnthropicServerAdapter(client: Anthropic): AngiServerAdapter {
  return {
    async *run(
      prompt: string,
      components: ComponentPayload[],
      tools: Anthropic.Tool[],
      systemPrompt: string
    ): AsyncIterable<AngiStreamChunk> {
      const stream = await client.messages.stream({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        tools: tools.length > 0 ? tools : undefined,
        messages: [{ role: "user", content: prompt }],
      });

      let pendingToolUses: Array<{
        id: string;
        name: string;
        inputJson: string;
      }> = [];
      let currentTool: { id: string; name: string; inputJson: string } | null = null;

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
          } else if (event.delta.type === "input_json_delta" && currentTool) {
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
            const [componentId, ...actionParts] = tool.name.split("__");
            const actionName = actionParts.join("__");
            let params: Record<string, unknown> = {};

            try {
              params = JSON.parse(tool.inputJson || "{}");
            } catch {
              // ignore parse errors
            }

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
