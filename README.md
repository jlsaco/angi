<div align="center">

# ✦ angi

**AI-native UI components for React.**

Mark components as AI-addressable. Expose safe actions.\
_Let Angi translate user intent into real interface behavior._

[![License: MIT](https://img.shields.io/badge/License-MIT-a78bfa.svg)](./LICENSE)
![Status](https://img.shields.io/badge/Status-Proof_of_Concept-8b5cf6)
![React](https://img.shields.io/badge/React-19+-61DAFB?logo=react&logoColor=white)

```
"Fill the name as Rogelio and set email to rog@angi.com"
```

The user types a sentence. Angi calls the right component actions. **That's it.**

---

</div>

## How it works

**Without Angi** — you build forms, tables, dashboards. Users click buttons.

**With Angi** — your components tell the AI what they can do. The user just _says what they want_.

```tsx
// This is all it takes to make a form AI-addressable
useAngiComponent({
  description: "Contact form",
  getState: () => ({ name, email }),
  actions: { fillField, resetForm },
});
```

> No client-side AI. No DOM scraping. Just declared intent, executed precisely.

---

## Getting Started

### 1 · Create the server route

This is the bridge between your UI and the LLM. A single file is enough.

```ts
// app/api/angi/route.ts  (Next.js App Router)
import { AngiAgent } from "@angi-ai/angi/server";
import { NextRequest } from "next/server";

const angi = new AngiAgent({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const stream = angi.processRequestStream(body);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

### 2 · Wrap your layout with the provider

```tsx
// app/layout.tsx
import { AngiNextProvider } from "@angi-ai/angi/client";

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

> **`AngiNextProvider`** is a zero-config wrapper that instantiates the Anthropic adapter and connects to `/api/angi` automatically. Use `<AngiProvider adapter={...}>` if you need a custom adapter.

### 3 · Drop in the chat widget

```tsx
import { AngiChatBubble } from "@angi-ai/angi/client";

// Renders a floating ✦ button — the user's gateway to the AI
<AngiChatBubble />;
```

### 4 · Make a component AI-addressable

```tsx
"use client";
import { useState } from "react";
import { Angi, useAngiComponent } from "@angi-ai/angi/client";
import type { AngiAction } from "@angi-ai/angi/client";

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const fillField: AngiAction = {
    description: "Set a field value",
    schema: { field: "string", value: "string" },
    execute: ({ field, value }) => {
      if (field === "name") setName(value as string);
      if (field === "email") setEmail(value as string);
    },
  };

  useAngiComponent({
    description: "Contact form with name and email fields",
    getState: () => ({ name, email }),
    actions: { fillField },
  });

  return (/* ...your JSX... */);
}

// Wrap it with an <Angi> boundary to assign permissions
export default function Page() {
  return (
    <Angi id="contact-form" permissions={["read", "write"]}>
      <ContactForm />
    </Angi>
  );
}
```

The user can now say _"Fill the name as José and set email to jose@angi.com"_ and the LLM will call `fillField` directly on the component.

---

## Key Concepts

| Concept                  | What it does                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **`<Angi>`**             | Boundary wrapper — provides `id` and `permissions` to any child component via context.                                               |
| **`useAngiComponent()`** | Registration hook — call it inside any component wrapped by `<Angi>` to expose state and actions to the AI.                          |
| **`useAngi()`**          | Consumer hook — access `sendPrompt()`, `isLoading`, and `streamText` from anywhere.                                                  |
| **`AngiAgent`**          | Server-side class — receives prompts, builds tools and system prompts from component metadata, streams the LLM response back as SSE. |

### Permissions

Each `<Angi>` boundary declares what the AI is allowed to do:

| Permission | Effect                                                       |
| ---------- | ------------------------------------------------------------ |
| `"read"`   | The component's current state is sent to the LLM as context. |
| `"write"`  | The LLM may invoke the component's registered actions.       |

Combine them freely: `permissions={["read", "write"]}` (this is the default).

---

## Prerequisites

### Environment Variables

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

Angi uses the **Anthropic Claude** API on the server side. You need a valid API key from [console.anthropic.com](https://console.anthropic.com/).

### Dependencies

Angi declares the following **peer dependencies** — your project must have them installed:

| Package             | Version   |
| ------------------- | --------- |
| `react`             | `^19.0.0` |
| `react-dom`         | `^19.0.0` |
| `@anthropic-ai/sdk` | `^0.78.0` |

Install them alongside Angi:

```bash
npm install @angi-ai/angi @anthropic-ai/sdk react react-dom
```

> If you're adding Angi to an existing React 19 / Next.js 15 project, you likely only need to install `@anthropic-ai/sdk`.

---

## Project Structure

```
angi/
├── packages/angi/         # The core package
│   └── src/
│       ├── client/        # React provider, components, hooks, adapters
│       ├── server/        # AngiAgent, tool builder, system prompt builder
│       └── shared/        # Types shared between client and server
├── examples/next-app/     # Proof-of-concept Next.js app
└── package.json           # npm workspaces root
```

Import paths:

```ts
import {
  Angi,
  AngiNextProvider,
  AngiChatBubble,
  useAngi,
  useAngiComponent,
} from "@angi-ai/angi/client";
import { AngiAgent } from "@angi-ai/angi/server";
```

---

## License

[MIT](./LICENSE)
