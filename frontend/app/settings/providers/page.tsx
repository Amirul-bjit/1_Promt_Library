"use client";

import { useState, useEffect } from "react";
import {
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import api from "@/lib/api";

type TestStatus = "idle" | "testing" | "success" | "failed";

interface Provider {
  id: string;
  name: string;
  is_configured: boolean;
  apiKey: string;
  testStatus: TestStatus;
  testMessage: string;
}

const PROVIDER_ENV_KEYS: Record<string, string> = {
  OPENAI: "OPENAI_API_KEY",
  ANTHROPIC: "ANTHROPIC_API_KEY",
  MISTRAL: "MISTRAL_API_KEY",
};

export default function ProvidersSettingsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await api.get("/executions/providers/");
      const data: { id: string; name: string; is_configured: boolean }[] =
        response.data;
      setProviders(
        data.map((p) => ({
          ...p,
          apiKey: "",
          testStatus: "idle",
          testMessage: "",
        }))
      );
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProvider = (id: string, patch: Partial<Provider>) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };

  const handleTestConnection = async (provider: Provider) => {
    if (!provider.apiKey.trim()) return;

    updateProvider(provider.id, { testStatus: "testing", testMessage: "" });

    try {
      const response = await api.post("/executions/test-provider/", {
        provider: provider.id,
        api_key: provider.apiKey,
      });
      updateProvider(provider.id, {
        testStatus: "success",
        testMessage: response.data.message ?? "Connection successful",
      });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        "Connection failed. Please check your API key.";
      updateProvider(provider.id, { testStatus: "failed", testMessage: msg });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading providers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <InformationCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
        <p>
          API keys are configured via environment variables on the server (e.g.{" "}
          <code className="font-mono font-semibold">OPENAI_API_KEY</code>). Use
          the test fields below to verify a key before adding it to your{" "}
          <code className="font-mono font-semibold">.env</code> file.
        </p>
      </div>

      {/* Provider cards */}
      {providers.map((provider) => (
        <div key={provider.id} className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {provider.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Env variable:{" "}
                <code className="font-mono font-semibold text-gray-700">
                  {PROVIDER_ENV_KEYS[provider.id]}
                </code>
              </p>
            </div>
            {provider.is_configured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                <XCircleIcon className="h-3.5 w-3.5" />
                Not configured
              </span>
            )}
          </div>

          {/* Test field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test an API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={provider.apiKey}
                  onChange={(e) =>
                    updateProvider(provider.id, {
                      apiKey: e.target.value,
                      testStatus: "idle",
                      testMessage: "",
                    })
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Paste a ${provider.name} API key to test...`}
                />
              </div>
              <button
                onClick={() => handleTestConnection(provider)}
                disabled={
                  !provider.apiKey.trim() || provider.testStatus === "testing"
                }
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {provider.testStatus === "testing" ? "Testing…" : "Test"}
              </button>
            </div>

            {/* Test result */}
            {provider.testStatus === "success" && (
              <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                <CheckCircleIcon className="h-4 w-4 shrink-0" />
                {provider.testMessage}
              </div>
            )}
            {provider.testStatus === "failed" && (
              <div className="mt-2 flex items-start gap-1 text-sm text-red-600">
                <XCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{provider.testMessage}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
