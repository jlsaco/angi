import type { Anthropic } from "@anthropic-ai/sdk";
import type { ComponentPayload } from "../../shared/types";

export function buildTools(components: ComponentPayload[]): Anthropic.Tool[] {
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
