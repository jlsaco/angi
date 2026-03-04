import type {
  GoogleGenAI,
  FunctionDeclaration,
  GenerateContentResponse,
  Type,
} from "@google/genai";
import type { AngiServerAdapter } from "../types";
import type {
  ComponentPayload,
  AngiStreamChunk,
  AngiToolDefinition,
} from "../../shared/types";
import { parseToolName } from "../core/parseToolName";

/**
 * Map Angi's simple type strings to Google GenAI Type enum values.
 */
function mapSchemaType(type: string): Type {
  switch (type) {
    case "number":
      return "NUMBER" as Type;
    case "boolean":
      return "BOOLEAN" as Type;
    case "integer":
      return "INTEGER" as Type;
    default:
      return "STRING" as Type;
  }
}

/**
 * Convert provider-agnostic AngiToolDefinition[] to Gemini FunctionDeclaration[].
 */
function toGeminiFunctionDeclarations(
  tools: AngiToolDefinition[]
): FunctionDeclaration[] {
  return tools.map((t) => {
    const properties: Record<
      string,
      { type: Type; description: string }
    > = {};

    for (const [key, prop] of Object.entries(t.input_schema.properties)) {
      properties[key] = {
        type: mapSchemaType(prop.type),
        description: prop.description,
      };
    }

    return {
      name: t.name,
      description: t.description,
      parameters: {
        type: "OBJECT" as Type,
        properties,
        required: t.input_schema.required,
      },
    };
  });
}

export function createGeminiServerAdapter(
  client: GoogleGenAI,
  model?: string
): AngiServerAdapter {
  return {
    async *run(
      prompt: string,
      _components: ComponentPayload[],
      tools: AngiToolDefinition[],
      systemPrompt: string
    ): AsyncIterable<AngiStreamChunk> {
      const functionDeclarations = toGeminiFunctionDeclarations(tools);

      const response = await client.models.generateContentStream({
        model: model ?? "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        config: {
          systemInstruction: systemPrompt,
          tools:
            functionDeclarations.length > 0
              ? [{ functionDeclarations }]
              : undefined,
          maxOutputTokens: 1024,
        },
      });

      for await (const chunk of response) {
        const candidates = (chunk as GenerateContentResponse).candidates;
        if (!candidates || candidates.length === 0) continue;

        const parts = candidates[0].content?.parts;
        if (!parts) continue;

        for (const part of parts) {
          // --- Text content ---
          if (part.text) {
            yield { type: "text", text: part.text };
          }

          // --- Function call ---
          if (part.functionCall) {
            const { name, args } = part.functionCall;
            if (!name) continue;

            const { componentId, actionName } = parseToolName(name);

            yield {
              type: "action",
              action: {
                componentId,
                actionName,
                params: (args as Record<string, unknown>) ?? {},
              },
            };
          }
        }
      }
    },
  };
}
