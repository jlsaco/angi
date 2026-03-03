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
      className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {PROVIDERS.map((p) => (
        <option key={p.value} value={p.value} className="bg-slate-900">
          {p.label}
        </option>
      ))}
    </select>
  );
}
