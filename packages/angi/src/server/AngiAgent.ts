import Anthropic from "@anthropic-ai/sdk";
import type { AngiAgentConfig, AngiResponse, AngiServerAdapter } from "./types";
import type { AngiRequestBody } from "../shared/types";
import { buildTools } from "./core/buildTools";
import { buildSystemPrompt } from "./core/buildSystemPrompt";
import { createAnthropicServerAdapter } from "./adapters/anthropic";

export class AngiAgent {
  private adapter: AngiServerAdapter;

  constructor(config: AngiAgentConfig) {
    if (config.adapter) {
      this.adapter = config.adapter;
    } else {
      const client = new Anthropic({ apiKey: config.apiKey });
      this.adapter = createAnthropicServerAdapter(client);
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

    const stream = this.adapter.run(prompt, components, tools, systemPrompt);

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
    
    // We bind 'this' carefully in case adapter.run relies on it
    const streamIter = this.adapter.run(prompt, components, tools, systemPrompt);
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        const sendSSE = (data: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          for await (const chunk of streamIter) {
            sendSSE(chunk);
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("[AngiAgent] Stream processing error:", err);
          sendSSE({ type: "text", text: "⚠️ An error occurred on the server." });
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } finally {
          controller.close();
        }
      },
      cancel() {
        // Stream reading was cancelled by consumer
      }
    });
  }
}
