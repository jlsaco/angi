"use client";

import { useProvider, type Provider } from "@/lib/providers";

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: "anthropic", label: "Anthropic (Claude)" },
  { value: "openai", label: "OpenAI (GPT)" },
  { value: "gemini", label: "Google (Gemini)" },
];

export function ProviderSwitcher() {
  const { provider, setProvider } = useProvider();

  return (
    <select
      value={provider}
      onChange={(e) => setProvider(e.target.value as Provider)}
      className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {PROVIDERS.map((p) => (
        <option key={p.value} value={p.value}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
