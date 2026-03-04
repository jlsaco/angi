import type {
  AngiAgentConfig,
  AngiResponse,
  AngiServerAdapter,
  AngiProvider,
} from "./types";
import type { AngiRequestBody } from "../shared/types";
import { buildTools } from "./core/buildTools";
import { buildSystemPrompt } from "./core/buildSystemPrompt";

/**
 * Lazily create the correct adapter based on the provider string.
 * Each provider SDK is dynamically imported so users only need to install
 * the SDK for the provider they actually use.
 */
async function createAdapterForProvider(
  provider: AngiProvider,
  apiKey: string,
  model?: string
): Promise<AngiServerAdapter> {
  switch (provider) {
    case "anthropic": {
      const Anthropic = (
        await import(/* webpackIgnore: true */ "@anthropic-ai/sdk")
      ).default;
      const { createAnthropicServerAdapter } = await import(
        "./adapters/anthropic"
      );
      const client = new Anthropic({ apiKey });
      return createAnthropicServerAdapter(client, model);
    }

    case "openai": {
      // Variable + webpackIgnore: bypasses both TypeScript and bundler resolution
      const openaiPkg = "openai";
      const OpenAI = (
        await import(/* webpackIgnore: true */ openaiPkg)
      ).default;
      const { createOpenAIServerAdapter } = await import(
        "./adapters/openai"
      );
      const client = new OpenAI({ apiKey });
      return createOpenAIServerAdapter(client, model);
    }

    case "gemini": {
      // Variable + webpackIgnore: bypasses both TypeScript and bundler resolution
      const geminiPkg = "@google/genai";
      const { GoogleGenAI } = await import(
        /* webpackIgnore: true */ geminiPkg
      );
      const { createGeminiServerAdapter } = await import(
        "./adapters/gemini"
      );
      const client = new GoogleGenAI({ apiKey });
      return createGeminiServerAdapter(client, model);
    }

    default:
      throw new Error(
        `[AngiAgent] Unknown provider "${provider}". ` +
          `Supported providers: "anthropic", "openai", "gemini".`
      );
  }
}

export class AngiAgent {
  private adapterPromise: Promise<AngiServerAdapter>;

  constructor(config: AngiAgentConfig) {
    if (config.adapter) {
      this.adapterPromise = Promise.resolve(config.adapter);
    } else {
      const provider = config.provider ?? "anthropic";
      this.adapterPromise = createAdapterForProvider(
        provider,
        config.apiKey,
        config.model
      );
    }
  }

  /**
   * Process a request and return the full response (text + actions).
   * Useful when streaming is not needed.
   */
  async processRequest(body: AngiRequestBody): Promise<AngiResponse> {
    const { prompt, components } = body;
    const tools = buildTools(components);
    const systemPrompt = buildSystemPrompt(components);
    const adapter = await this.adapterPromise;

    const stream = adapter.run(prompt, components, tools, systemPrompt);

    let text = "";
    const actions: AngiResponse["actions"] = [];

    for await (const chunk of stream) {
      if (chunk.type === "text") {
        text += chunk.text;
      } else if (chunk.type === "action") {
        actions.push(chunk.action);
      }
    }

    return { text, actions };
  }

  /**
   * Process a request and return a ReadableStream of SSE events.
   * Compatible with Web Streams API (used by Next.js, Edge, standard Request/Response).
   */
  processRequestStream(body: AngiRequestBody): ReadableStream {
    const { prompt, components } = body;
    const tools = buildTools(components);
    const systemPrompt = buildSystemPrompt(components);
    const adapterPromise = this.adapterPromise;
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        const sendSSE = (data: unknown) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };

        try {
          const adapter = await adapterPromise;
          const streamIter = adapter.run(
            prompt,
            components,
            tools,
            systemPrompt
          );
          for await (const chunk of streamIter) {
            sendSSE(chunk);
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("[AngiAgent] Stream processing error:", err);
          sendSSE({
            type: "text",
            text: "⚠️ An error occurred on the server.",
          });
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } finally {
          controller.close();
        }
      },
      cancel() {
        // Stream reading was cancelled by consumer
      },
    });
  }
}
