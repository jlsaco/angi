import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ComponentPayload {
  id: string;
  description: string;
  permissions: string[];
  state?: unknown;
  actions: Record<
    string,
    { description: string; schema: Record<string, string> }
  >;
}

interface AngiRequestBody {
  prompt: string;
  components: ComponentPayload[];
}

function buildTools(components: ComponentPayload[]): Anthropic.Tool[] {
  const tools: Anthropic.Tool[] = [];

  for (const comp of components) {
    if (!comp.permissions.includes("write")) continue;

    for (const [actionName, action] of Object.entries(comp.actions)) {
      const toolName = `${comp.id}__${actionName}`;
      const properties: Record<string, { type: string; description: string }> =
        {};

      for (const [key, type] of Object.entries(action.schema)) {
        properties[key] = { type, description: key };
      }

      tools.push({
        name: toolName,
        description: `[${comp.id}] ${action.description}`,
        input_schema: {
          type: "object" as const,
          properties,
          required: Object.keys(action.schema),
        },
      });
    }
  }

  return tools;
}

function buildSystemPrompt(components: ComponentPayload[]): string {
  const parts: string[] = [
    "You are Angi — an AI assistant that can read and operate UI components on behalf of the user.",
    "When the user asks you to perform an action, use the provided tools to do it.",
    "When you perform actions, do so silently — just confirm briefly in text what you did.",
    "",
    "## Registered components:",
  ];

  for (const comp of components) {
    parts.push(`\n### ${comp.id} (${comp.description})`);
    parts.push(`Permissions: ${comp.permissions.join(", ")}`);
    if (comp.permissions.includes("read") && comp.state != null) {
      parts.push(`Current state: ${JSON.stringify(comp.state, null, 2)}`);
    }
  }

  return parts.join("\n");
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as AngiRequestBody;
  const { prompt, components } = body;

  const tools = buildTools(components);
  const systemPrompt = buildSystemPrompt(components);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendSSE = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        // Use streaming with tool_use
        const anthropicStream = await client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: systemPrompt,
          tools,
          messages: [{ role: "user", content: prompt }],
        });

        let pendingToolUses: Array<{
          id: string;
          name: string;
          inputJson: string;
        }> = [];
        let currentTool: { id: string; name: string; inputJson: string } | null = null;

        for await (const event of anthropicStream) {
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
              sendSSE({ type: "text", text: event.delta.text });
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

              sendSSE({
                type: "action",
                action: { componentId, actionName, params },
              });
            }
            pendingToolUses = [];
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        console.error("[Angi API] Error:", err);
        sendSSE({ type: "text", text: "⚠️ An error occurred on the server." });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
