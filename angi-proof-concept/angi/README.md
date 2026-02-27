# `angi/` — AI-Native UI Runtime

> **Proof of concept.** This package is the client-side runtime that lets an LLM read and operate your React UI components through natural-language prompts.

---

## How It Works

```
User types a prompt
      │
      ▼
AngiChatBubble / useAngi.sendPrompt()
      │
      ▼
AngiAdapter.run()  ──────────────────────────►  POST /api/angi
      │                                           (Anthropic SDK runs server-side)
      │  ◄── SSE stream of AngiStreamChunks ──────
      ▼
AngiProvider dispatches chunks:
  • type: "text"   → appends to streamText
  • type: "action" → looks up component in registry, checks "write" permission,
                     calls action.execute(params)
```

The LLM never runs in the browser. The **adapter** is a thin HTTP client; all Anthropic API calls and tool-building logic live in `app/api/angi/route.ts`.

---

## Package Structure

| File                    | Role                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `index.ts`              | Public barrel — re-exports everything consumers need                                                   |
| `types.ts`              | Core TypeScript interfaces (`AngiAdapter`, `AngiAction`, `AngiStreamChunk`, …)                         |
| `AngiProvider.tsx`      | React context provider; owns `sendPrompt`, `isLoading`, `streamText`                                   |
| `NextProvider.tsx`      | `AngiNextProvider` — zero-config wrapper for Next.js App Router layouts                                |
| `Angi.tsx`              | `Angi.Form / .Table / .Section` — thin boundary wrappers that inject `id` + `permissions` into context |
| `useAngi.ts`            | Consumer hook to access `AngiContextValue`                                                             |
| `useAngiComponent.ts`   | Registration hook — call inside any component wrapped by `<Angi.*>`                                    |
| `registry.ts`           | Module-level `Map` singleton that tracks all live `AngiComponentDefinition`s                           |
| `adapters/anthropic.ts` | `createAnthropicAdapter()` — SSE client that posts to `/api/angi`                                      |

---

## Quick Start

### 1. Provide an API key

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Wrap your layout

```tsx
// app/layout.tsx
import { AngiNextProvider } from "@/angi";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AngiNextProvider>{children}</AngiNextProvider>
      </body>
    </html>
  );
}
```

> **`AngiNextProvider`** is a convenience wrapper. Use `AngiProvider` directly if you need to supply your own adapter.

### 3. Drop in the chat widget

```tsx
import { AngiChatBubble } from "@/angi";

// Renders a floating ✨ button in the bottom-right corner
<AngiChatBubble />;
```

### 4. Register a component

```tsx
"use client";
import { Angi, useAngiComponent } from "@/angi";
import { useState } from "react";

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useAngiComponent({
    description: "Contact form with name and email fields",
    getState: () => ({ name, email }),
    actions: {
      fillField: {
        description: "Set a field value",
        schema: { field: "string", value: "string" },
        execute: ({ field, value }) => {
          if (field === "name") setName(value as string);
          if (field === "email") setEmail(value as string);
        },
      },
    },
  });

  return (/* ... your JSX ... */);
}

// Wrap it with an Angi boundary to assign an id and permissions
export default function Page() {
  return (
    <Angi.Form id="contact-form" permissions={["read", "write"]}>
      <ContactForm />
    </Angi.Form>
  );
}
```

The user can now say _"Fill the name as José and set email to jose@angi.com"_ and the LLM will call `fillField` directly.

---

## Public API

### Providers

| Export             | Props                 | Description                                                                                    |
| ------------------ | --------------------- | ---------------------------------------------------------------------------------------------- |
| `AngiNextProvider` | `children`            | Zero-config provider for Next.js App Router. Instantiates the Anthropic adapter automatically. |
| `AngiProvider`     | `adapter`, `children` | Generic provider. Bring your own `AngiAdapter`.                                                |

### Components

| Export           | Props                           | Description                                              |
| ---------------- | ------------------------------- | -------------------------------------------------------- |
| `AngiChatBubble` | —                               | Floating chat widget. Auto-connects to the Angi runtime. |
| `Angi.Form`      | `id`, `permissions`, `children` | Boundary wrapper for form components.                    |
| `Angi.Table`     | `id`, `permissions`, `children` | Boundary wrapper for table components.                   |
| `Angi.Section`   | `id`, `permissions`, `children` | Boundary wrapper for generic sections.                   |

### Hooks

| Export                   | Returns                                 | Description                                                                                |
| ------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------ |
| `useAngi()`              | `{ sendPrompt, isLoading, streamText }` | Send a prompt programmatically; read streaming response.                                   |
| `useAngiComponent(opts)` | `void`                                  | Register a component in the global registry. Must be called inside an `<Angi.*>` boundary. |

### Adapters

| Export                              | Description                                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| `createAnthropicAdapter(endpoint?)` | Returns an `AngiAdapter` that POSTs to `/api/angi` (default) and streams SSE back. |

### Types

```ts
AngiPermission; // "read" | "write"
AngiAction; // { description, schema, execute }
AngiComponentDefinition; // full registry entry
AngiStreamChunk; // { type: "text", text } | { type: "action", action: { componentId, actionName, params } }
AngiAdapter; // interface: run(prompt, components): AsyncIterable<AngiStreamChunk>
```

---

## Permissions

Each `<Angi.*>` boundary declares `permissions`:

| Permission | Effect                                                       |
| ---------- | ------------------------------------------------------------ |
| `"read"`   | The component's current state is sent to the LLM as context. |
| `"write"`  | The LLM may call the component's registered actions.         |

Both can be combined: `permissions={["read", "write"]}`.

---

## Server Route

The adapter communicates with `app/api/angi/route.ts`, which:

1. Receives `{ prompt, components }` as JSON.
2. Builds Anthropic **tools** from each writable component's action schemas.
3. Builds a **system prompt** that describes registered components and their current state.
4. Streams the Anthropic response back as **SSE** (`text/event-stream`).
5. Converts `tool_use` events into `AngiStreamChunk` `action` messages.

---

## Adding a New Adapter

Implement `AngiAdapter` and pass it to `<AngiProvider>`:

```ts
import type { AngiAdapter } from "@/angi";

export function createOpenAIAdapter(): AngiAdapter {
  return {
    async *run(prompt, components) {
      // your streaming logic here
      yield { type: "text", text: "Hello from OpenAI!" };
    },
  };
}
```
