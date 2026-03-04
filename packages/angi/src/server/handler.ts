import { AngiAgent } from "./AngiAgent";
import { resolveEnvConfig } from "./env";
import type { AngiProvider } from "./types";

export interface AngiHandlerOptions {
  /** Explicit provider. Auto-detected from env if omitted. */
  provider?: AngiProvider;
  /** Explicit API key. Read from env if omitted. */
  apiKey?: string;
  /** Override the default model for the chosen provider. */
  model?: string;
}

/**
 * Create a Web-standard Request handler for Angi.
 *
 * Works with Next.js App Router, Hono, Cloudflare Workers,
 * and any framework using the Web Fetch API (Request/Response).
 *
 * @example
 * // app/api/angi/route.ts
 * import { createAngiHandler } from "@angi-ai/angi/server";
 * export const POST = createAngiHandler();
 *
 * @example
 * // With explicit config
 * export const POST = createAngiHandler({ provider: "openai", model: "gpt-4o" });
 */
export function createAngiHandler(options?: AngiHandlerOptions) {
  const { provider, apiKey } = resolveEnvConfig(options);

  const agent = new AngiAgent({
    apiKey,
    provider,
    model: options?.model,
  });

  return async (req: Request): Promise<Response> => {
    try {
      const body = await req.json();
      const stream = agent.processRequestStream(body);

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } catch (err) {
      console.error("[Angi] Handler error:", err);
      return new Response(
        JSON.stringify({ error: "Internal Server Error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  };
}
