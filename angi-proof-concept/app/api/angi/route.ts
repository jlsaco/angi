import { AngiAgent } from "../../../angi/server";
import { NextRequest } from "next/server";

const angi = new AngiAgent({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Process the request and get a web stream back
    const stream = angi.processRequestStream(body);

    // Return it directly to the client as Server-Sent Events
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[Angi API Route] Error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
