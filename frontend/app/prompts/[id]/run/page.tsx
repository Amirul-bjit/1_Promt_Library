"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Prompt, Execution } from "@/types";
import ProviderModelSelector from "@/components/execution/ProviderModelSelector";
import FeedbackWidget from "@/components/execution/FeedbackWidget";

export default function RunPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const promptId = resolvedParams.id;

  const [provider, setProvider] = useState("OPENAI");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [execution, setExecution] = useState<Execution | null>(null);

  const { data: prompt, isLoading } = useQuery<Prompt>({
    queryKey: ["prompt", promptId],
    queryFn: async () => {
      const response = await api.get(`/prompts/templates/${promptId}/`);
      return response.data;
    },
  });

  // Extract variables live from the prompt body so we always see all {{variable}} placeholders
  const promptBody =
    (prompt?.current_version_data as any)?.body ??
    (prompt?.current_version_data as any)?.content ??
    "";
  const extractedVariables: string[] = promptBody
    ? Array.from(new Set([...promptBody.matchAll(/\{\{([^}]+)\}\}/g)].map((m: RegExpMatchArray) => m[1].trim())))
    : [];

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const response = await api.post("/executions/", {
        prompt: promptId,
        provider,
        model,
        input_variables: variables,
      });

      setExecution(response.data);

      // Poll for completion
      const pollExecution = async () => {
        const result = await api.get(`/executions/${response.data.id}/`);
        setExecution(result.data);

        if (result.data.status === "PENDING" || result.data.status === "RUNNING") {
          setTimeout(pollExecution, 1000);
        } else {
          setIsRunning(false);
        }
      };

      setTimeout(pollExecution, 1000);
    } catch (error) {
      console.error("Failed to run prompt:", error);
      alert("Failed to run prompt. Please try again.");
      setIsRunning(false);
    }
  };

  const handleFeedback = async (feedback: any) => {
    if (!execution) return;
    // TODO: Send feedback to API
    console.log("Feedback:", feedback);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Test Runner</h1>
              <p className="text-sm text-gray-500 mt-1">{prompt?.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
              <ProviderModelSelector
                provider={provider}
                model={model}
                onProviderChange={setProvider}
                onModelChange={setModel}
              />
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Variables</h2>
              {extractedVariables.length === 0 ? (
                <p className="text-sm text-gray-500">No variables in this prompt.</p>
              ) : (
                <div className="space-y-4">
                  {extractedVariables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {variable}
                      </label>
                      <input
                        type="text"
                        value={variables[variable] || ""}
                        onChange={(e) =>
                          setVariables({ ...variables, [variable]: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                        placeholder={`Enter ${variable}...`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Prompt Preview</h2>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-900 whitespace-pre-wrap">
                {promptBody || "No content"}
              </div>
            </div>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <PlayIcon className="mr-2 h-5 w-5" />
              {isRunning ? "Running..." : "Run Prompt"}
            </button>
          </div>

          {/* Right Panel - Output */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Response</h2>
              {!execution ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                  <p className="text-gray-500">
                    Configure your prompt and click Run to see the response.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        execution.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : execution.status === "FAILED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {execution.status}
                    </span>
                  </div>

                  {execution.status === "COMPLETED" && (
                    <>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 whitespace-pre-wrap text-sm text-gray-900">
                        {execution.response}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <div className="text-xs text-gray-500">Tokens</div>
                          <div className="mt-1 text-lg font-semibold text-gray-900">
                            {execution.tokens_used || "-"}
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <div className="text-xs text-gray-500">Cost</div>
                          <div className="mt-1 text-lg font-semibold text-gray-900">
                            ${execution.cost || "0.00"}
                          </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <div className="text-xs text-gray-500">Duration</div>
                          <div className="mt-1 text-lg font-semibold text-gray-900">
                            {execution.duration_ms ? `${execution.duration_ms}ms` : "-"}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {execution.status === "FAILED" && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {execution.error_message || "An error occurred"}
                    </div>
                  )}

                  {execution.status === "RUNNING" && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-500">Processing...</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {execution?.status === "COMPLETED" && (
              <FeedbackWidget onFeedback={handleFeedback} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
