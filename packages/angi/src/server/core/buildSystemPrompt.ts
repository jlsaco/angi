import type { ComponentPayload } from "../../shared/types";

export function buildSystemPrompt(components: ComponentPayload[]): string {
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
