import type {
  AngiAdapter,
  AngiComponentDefinition,
  AngiStreamChunk,
} from "../types";

/**
 * createAnthropicAdapter — the Anthropic implementation of AngiAdapter.
 *
 * Calls your app's /api/angi server route (which holds the Anthropic SDK
 * and the API key server-side). Returns an async iterable of AngiStreamChunks.
 *
 * Usage:
 *   const adapter = createAnthropicAdapter()
 *   <AngiProvider adapter={adapter}>...</AngiProvider>
 */
export function createAnthropicAdapter(
  endpoint = "/api/angi"
): AngiAdapter {
  return {
    async *run(
      prompt: string,
      components: AngiComponentDefinition[]
    ): AsyncIterable<AngiStreamChunk> {
      // Serialize components for the server — send state snapshot + action schemas
      const componentPayload = components.map((c) => ({
        id: c.id,
        description: c.description,
        permissions: c.permissions,
        state: c.permissions.includes("read") ? c.getState() : undefined,
        actions: c.permissions.includes("write")
          ? Object.fromEntries(
              Object.entries(c.actions).map(([name, action]) => [
                name,
                { description: action.description, schema: action.schema },
              ])
            )
          : {},
      }));

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, components: componentPayload }),
      });

      if (!response.ok || !response.body) {
        yield {
          type: "text",
          text: "⚠️ Failed to reach Angi API. Check your server logs.",
        };
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") return;

          try {
            const chunk = JSON.parse(raw) as AngiStreamChunk;
            yield chunk;
          } catch {
            // Ignore malformed SSE lines
          }
        }
      }
    },
  };
}
