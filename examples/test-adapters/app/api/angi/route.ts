import { AngiAgent } from "@angi-ai/angi/server";
import type { AngiProvider } from "@angi-ai/angi/server";
import { NextRequest } from "next/server";

const API_KEYS: Record<AngiProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
};

export async function POST(req: NextRequest) {
  try {
    const providerParam =
      req.nextUrl.searchParams.get("provider") || "anthropic";
    const provider = providerParam as AngiProvider;

    const envVar = API_KEYS[provider];
    if (!envVar) {
      return new Response(
        JSON.stringify({ error: `Unknown provider: ${provider}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = process.env[envVar];
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: `Missing API key for ${provider}. Set ${envVar} in .env.local`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const angi = new AngiAgent({ apiKey, provider });
    const body = await req.json();
    const stream = angi.processRequestStream(body);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[Angi API Route] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
