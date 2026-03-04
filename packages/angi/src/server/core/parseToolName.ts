/**
 * Parse an Angi tool name (e.g. "contact-form__setField") into componentId and actionName.
 */
export function parseToolName(toolName: string): {
  componentId: string;
  actionName: string;
} {
  const [componentId, ...actionParts] = toolName.split("__");
  return { componentId, actionName: actionParts.join("__") };
}

/**
 * Safely parse a JSON string into params, returning an empty object on failure.
 */
export function parseToolParams(json: string): Record<string, unknown> {
  try {
    return JSON.parse(json || "{}");
  } catch {
    return {};
  }
}
