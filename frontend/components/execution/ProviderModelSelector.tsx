"use client";

import { useState } from "react";
import { clsx } from "clsx";

interface ProviderModelSelectorProps {
  provider: string;
  model: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  className?: string;
}

const PROVIDERS = {
  OPENAI: {
    name: "OpenAI",
    models: [
      { id: "gpt-4", name: "GPT-4" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
    ],
  },
  ANTHROPIC: {
    name: "Anthropic",
    models: [
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
      { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet" },
      { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" },
    ],
  },
  MISTRAL: {
    name: "Mistral AI",
    models: [
      { id: "mistral-large-latest", name: "Mistral Large" },
      { id: "mistral-medium-latest", name: "Mistral Medium" },
      { id: "mistral-small-latest", name: "Mistral Small" },
    ],
  },
};

export default function ProviderModelSelector({
  provider,
  model,
  onProviderChange,
  onModelChange,
  className,
}: ProviderModelSelectorProps) {
  const currentProvider = PROVIDERS[provider as keyof typeof PROVIDERS];
  const availableModels = currentProvider?.models || [];

  return (
    <div className={clsx("flex gap-4", className)}>
      {/* Provider Selector */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Provider
        </label>
        <select
          value={provider}
          onChange={(e) => {
            onProviderChange(e.target.value);
            // Reset model when provider changes
            const newProvider = PROVIDERS[e.target.value as keyof typeof PROVIDERS];
            if (newProvider?.models[0]) {
              onModelChange(newProvider.models[0].id);
            }
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
        >
          {Object.entries(PROVIDERS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.name}
            </option>
          ))}
        </select>
      </div>

      {/* Model Selector */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Model
        </label>
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
        >
          {availableModels.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
