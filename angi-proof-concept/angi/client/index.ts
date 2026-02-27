// Public barrel for the client-side package
export { AngiProvider } from "./components/AngiProvider";
export { AngiNextProvider } from "./providers/NextProvider";
export { AngiChatBubble } from "./components/AngiChatBubble";
export { Angi } from "./components/Angi";
export { useAngi } from "./hooks/useAngi";
export { useAngiComponent } from "./hooks/useAngiComponent";
export { createAnthropicAdapter } from "./adapters/anthropic";

export type {
  AngiAction,
  AngiAdapter,
  AngiComponentDefinition,
  AngiPermission,
  AngiStreamChunk,
  AngiContextValue,
} from "./types";
