"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Execution } from "@/types";
import FeedbackWidget from "@/components/execution/FeedbackWidget";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

export default function ExecutionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const executionId = resolvedParams.id;

  const { data: execution, isLoading } = useQuery<Execution>({
    queryKey: ["execution", executionId],
    queryFn: async () => {
      const response = await api.get(`/executions/${executionId}/`);
      return response.data;
    },
  });

  const handleFeedback = async (feedback: any) => {
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

  if (!execution) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Execution not found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "RUNNING":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Execution Detail</h1>
              <p className="text-sm text-gray-500 mt-1">
                {execution.prompt_title} • v{execution.prompt_version}
              </p>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(execution.status)}`}>
              {execution.status}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Input Prompt</h2>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm whitespace-pre-wrap">
                {execution.rendered_prompt}
              </div>
            </div>

            {/* Output */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Response</h2>
              {execution.status === "COMPLETED" ? (
                <MarkdownRenderer content={execution.response} />
              ) : execution.status === "FAILED" ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {execution.error_message || "An error occurred"}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Execution is {execution.status.toLowerCase()}...
                </div>
              )}
            </div>

            {/* Variables */}
            {Object.keys(execution.input_variables).length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Input Variables</h2>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Object.entries(execution.input_variables).map(([key, value]) => (
                    <div key={key} className="border-l-2 border-indigo-500 pl-4">
                      <dt className="text-xs font-medium text-gray-500">{key}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Feedback */}
            {execution.status === "COMPLETED" && (
              <FeedbackWidget onFeedback={handleFeedback} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metrics */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metrics</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-medium text-gray-500">Provider</dt>
                  <dd className="mt-1 text-sm text-gray-900">{execution.provider}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Model</dt>
                  <dd className="mt-1 text-sm text-gray-900">{execution.model}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Tokens Used</dt>
                  <dd className="mt-1 text-sm text-gray-900">{execution.tokens_used || "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Cost</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {execution.cost ? `$${execution.cost}` : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Duration</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {execution.duration_ms ? `${execution.duration_ms}ms` : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(execution.created_at).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Metadata */}
            {Object.keys(execution.metadata || {}).length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
                <pre className="text-xs text-gray-700 overflow-auto">
                  {JSON.stringify(execution.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
