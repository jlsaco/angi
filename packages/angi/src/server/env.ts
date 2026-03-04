import type { AngiProvider } from "./types";

const PROVIDER_ENV_KEYS: Record<AngiProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
};

const PROVIDER_DETECTION_ORDER: AngiProvider[] = [
  "anthropic",
  "openai",
  "gemini",
];

export interface ResolvedEnvConfig {
  provider: AngiProvider;
  apiKey: string;
}

/**
 * Resolve provider and API key from environment variables.
 *
 * Priority:
 * 1. Explicit provider/apiKey passed as options
 * 2. ANGI_PROVIDER env var + corresponding API key env var
 * 3. Auto-detect: first provider whose API key env var is set
 */
export function resolveEnvConfig(options?: {
  provider?: AngiProvider;
  apiKey?: string;
}): ResolvedEnvConfig {
  if (options?.provider && options?.apiKey) {
    return { provider: options.provider, apiKey: options.apiKey };
  }

  const provider: AngiProvider | undefined =
    options?.provider ??
    (process.env.ANGI_PROVIDER as AngiProvider | undefined) ??
    autoDetectProvider();

  if (!provider) {
    throw new Error(
      "[Angi] Could not determine provider. Set ANGI_PROVIDER env var, " +
        "or set one of: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY."
    );
  }

  const apiKey = options?.apiKey ?? process.env[PROVIDER_ENV_KEYS[provider]];

  if (!apiKey) {
    throw new Error(
      `[Angi] Missing API key for provider "${provider}". ` +
        `Set ${PROVIDER_ENV_KEYS[provider]} in your environment.`
    );
  }

  return { provider, apiKey };
}

function autoDetectProvider(): AngiProvider | undefined {
  for (const p of PROVIDER_DETECTION_ORDER) {
    if (process.env[PROVIDER_ENV_KEYS[p]]) return p;
  }
  return undefined;
}
