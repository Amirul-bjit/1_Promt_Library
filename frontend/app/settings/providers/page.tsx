"use client";

import { useState } from "react";
import { KeyIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function ProvidersSettingsPage() {
  const [providers, setProviders] = useState([
    {
      id: "openai",
      name: "OpenAI",
      apiKey: "",
      isConfigured: false,
      isDefault: true,
      status: "not_tested",
    },
    {
      id: "anthropic",
      name: "Anthropic",
      apiKey: "",
      isConfigured: false,
      isDefault: false,
      status: "not_tested",
    },
    {
      id: "mistral",
      name: "Mistral AI",
      apiKey: "",
      isConfigured: false,
      isDefault: false,
      status: "not_tested",
    },
  ]);

  const handleApiKeyChange = (providerId: string, value: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId ? { ...p, apiKey: value, isConfigured: !!value, status: "not_tested" } : p
      )
    );
  };

  const handleTestConnection = async (providerId: string) => {
    // TODO: Implement test connection
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId ? { ...p, status: "testing" } : p
      )
    );

    // Simulate API call
    setTimeout(() => {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId ? { ...p, status: Math.random() > 0.3 ? "success" : "failed" } : p
        )
      );
    }, 1500);
  };

  const handleSetDefault = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) => ({ ...p, isDefault: p.id === providerId }))
    );
  };

  return (
    <div>
      {/* Provider Configuration */}
      <div className="space-y-6">
          {providers.map((provider) => (
            <div key={provider.id} className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Configure your {provider.name} API credentials
                  </p>
                </div>
                {provider.isDefault && (
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                    Default
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <KeyIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={provider.apiKey}
                        onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                        placeholder={`Enter your ${provider.name} API key...`}
                      />
                    </div>
                    <button
                      onClick={() => handleTestConnection(provider.id)}
                      disabled={!provider.isConfigured || provider.status === "testing"}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {provider.status === "testing" ? "Testing..." : "Test Connection"}
                    </button>
                  </div>

                  {/* Status */}
                  {provider.status === "success" && (
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <CheckCircleIcon className="mr-1 h-4 w-4" />
                      Connection successful
                    </div>
                  )}
                  {provider.status === "failed" && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                      <XCircleIcon className="mr-1 h-4 w-4" />
                      Connection failed. Please check your API key.
                    </div>
                  )}
                </div>

                {provider.isConfigured && !provider.isDefault && (
                  <button
                    onClick={() => handleSetDefault(provider.id)}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Set as default provider
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              // TODO: Save settings
              alert("Settings saved!");
            }}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
