"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function ABTestPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const promptId = resolvedParams.id;

  const [variantA, setVariantA] = useState("");
  const [variantB, setVariantB] = useState("");
  const [testInputs, setTestInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const { data: prompt } = useQuery({
    queryKey: ["prompt", promptId],
    queryFn: async () => {
      const response = await api.get(`/prompts/templates/${promptId}/`);
      return response.data;
    },
  });

  const handleRunTest = async () => {
    setIsRunning(true);
    try {
      // Run both variants
      const [resultA, resultB] = await Promise.all([
        api.post("/executions/", {
          prompt: promptId,
          provider: "OPENAI",
          model: "gpt-3.5-turbo",
          input_variables: { ...testInputs, prompt_override: variantA },
        }),
        api.post("/executions/", {
          prompt: promptId,
          provider: "OPENAI",
          model: "gpt-3.5-turbo",
          input_variables: { ...testInputs, prompt_override: variantB },
        }),
      ]);

      setResults({ variantA: resultA.data, variantB: resultB.data });
    } catch (error) {
      console.error("Failed to run A/B test:", error);
      alert("Failed to run A/B test. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">A/B Test Manager</h1>
              <p className="text-sm text-gray-500 mt-1">{prompt?.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Variants Input */}
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Variant A</h2>
              <textarea
                value={variantA}
                onChange={(e) => setVariantA(e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter variant A prompt..."
              />
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Variant B</h2>
              <textarea
                value={variantB}
                onChange={(e) => setVariantB(e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter variant B prompt..."
              />
            </div>
          </div>

          {/* Test Inputs */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Inputs</h2>
            <div className="space-y-4">
              {prompt?.current_version_data?.variables.map((variable: string) => (
                <div key={variable}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {variable}
                  </label>
                  <input
                    type="text"
                    value={testInputs[variable] || ""}
                    onChange={(e) =>
                      setTestInputs({ ...testInputs, [variable]: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleRunTest}
              disabled={isRunning || !variantA || !variantB}
              className="mt-4 w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isRunning ? "Running Tests..." : "Run A/B Test"}
            </button>
          </div>

          {/* Results */}
          {results && (
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Result A</h2>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm whitespace-pre-wrap">
                  {results.variantA.response || "No response"}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Tokens</div>
                    <div className="text-lg font-semibold">{results.variantA.tokens_used}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Cost</div>
                    <div className="text-lg font-semibold">${results.variantA.cost}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Result B</h2>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm whitespace-pre-wrap">
                  {results.variantB.response || "No response"}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Tokens</div>
                    <div className="text-lg font-semibold">{results.variantB.tokens_used}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Cost</div>
                    <div className="text-lg font-semibold">${results.variantB.cost}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
