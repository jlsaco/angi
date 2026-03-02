import type OpenAI from "openai";
import type { AngiServerAdapter } from "../types";
import type {
  ComponentPayload,
  AngiStreamChunk,
  AngiToolDefinition,
} from "../../shared/types";

/**
 * Convert provider-agnostic AngiToolDefinition[] to OpenAI function-calling format.
 */
function toOpenAITools(
  tools: AngiToolDefinition[]
): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return tools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: {
        type: t.input_schema.type,
        properties: t.input_schema.properties,
        required: t.input_schema.required,
      },
    },
  }));
}

export function createOpenAIServerAdapter(
  client: OpenAI,
  model?: string
): AngiServerAdapter {
  return {
    async *run(
      prompt: string,
      _components: ComponentPayload[],
      tools: AngiToolDefinition[],
      systemPrompt: string
    ): AsyncIterable<AngiStreamChunk> {
      const openaiTools = toOpenAITools(tools);

      const stream = await client.chat.completions.create({
        model: model ?? "gpt-4o-mini",
        max_tokens: 1024,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        tools: openaiTools.length > 0 ? openaiTools : undefined,
      });

      // Track tool calls being accumulated from streamed deltas.
      // OpenAI streams tool calls as incremental deltas on each chunk.
      const toolCallAccumulators: Map<
        number,
        { id: string; name: string; argumentsJson: string }
      > = new Map();

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta;
        if (!delta) continue;

        // --- Text content ---
        if (delta.content) {
          yield { type: "text", text: delta.content };
        }

        // --- Tool call deltas ---
        if (delta.tool_calls) {
          for (const toolCallDelta of delta.tool_calls) {
            const idx = toolCallDelta.index;

            if (!toolCallAccumulators.has(idx)) {
              toolCallAccumulators.set(idx, {
                id: toolCallDelta.id ?? "",
                name: toolCallDelta.function?.name ?? "",
                argumentsJson: "",
              });
            }

            const acc = toolCallAccumulators.get(idx)!;

            // Accumulate function name (usually arrives in the first delta)
            if (toolCallDelta.function?.name) {
              acc.name = toolCallDelta.function.name;
            }

            // Accumulate JSON arguments (arrives in fragments)
            if (toolCallDelta.function?.arguments) {
              acc.argumentsJson += toolCallDelta.function.arguments;
            }
          }
        }

        // --- Finish reason ---
        const finishReason = chunk.choices?.[0]?.finish_reason;
        if (finishReason === "tool_calls" || finishReason === "stop") {
          // Emit all accumulated tool calls
          for (const [, acc] of toolCallAccumulators) {
            if (!acc.name) continue;

            const [componentId, ...actionParts] = acc.name.split("__");
            const actionName = actionParts.join("__");
            let params: Record<string, unknown> = {};

            try {
              params = JSON.parse(acc.argumentsJson || "{}");
            } catch {
              // ignore parse errors
            }

            yield {
              type: "action",
              action: { componentId, actionName, params },
            };
          }
          toolCallAccumulators.clear();
        }
      }
    },
  };
}
