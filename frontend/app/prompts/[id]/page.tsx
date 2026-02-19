"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, PlayIcon, PencilIcon, DocumentDuplicateIcon, ClockIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Prompt, Execution } from "@/types";
import VariableChipEditor from "@/components/prompts/VariableChipEditor";
import { formatDistanceToNow } from "date-fns";

export default function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const promptId = resolvedParams.id;

  const { data: prompt, isLoading } = useQuery<Prompt>({
    queryKey: ["prompt", promptId],
    queryFn: async () => {
      const response = await api.get(`/prompts/templates/${promptId}/`);
      return response.data;
    },
  });

  const { data: executions = [] } = useQuery<Execution[]>({
    queryKey: ["executions", promptId],
    queryFn: async () => {
      const response = await api.get(`/executions/?prompt=${promptId}&limit=5`);
      return response.data.results || response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Prompt not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/prompts")}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{prompt.title}</h1>
                <p className="text-sm text-gray-500 mt-1">{prompt.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/prompts/${promptId}/run`)}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <PlayIcon className="mr-2 h-5 w-5" />
                Run
              </button>
              <button
                onClick={() => router.push(`/prompts/${promptId}/edit`)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <PencilIcon className="mr-2 h-5 w-5" />
                Edit
              </button>
              <button
                onClick={() => {/* TODO: Duplicate */}}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <DocumentDuplicateIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Body */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Prompt Template</h2>
              <VariableChipEditor
                content={prompt.current_version_data?.content || ""}
                readonly
              />
            </div>

            {/* Recent Executions */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Executions</h2>
                <button
                  onClick={() => router.push(`/executions?prompt=${promptId}`)}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  View All
                </button>
              </div>
              {executions.length === 0 ? (
                <p className="text-sm text-gray-500">No executions yet.</p>
              ) : (
                <div className="space-y-3">
                  {executions.map((execution) => (
                    <div
                      key={execution.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/executions/${execution.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            execution.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                            execution.status === "FAILED" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {execution.status}
                          </span>
                          <span className="text-gray-600">{execution.provider}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{execution.model}</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {(() => {
                            const ts = (execution as any).executed_at ?? (execution as any).created_at;
                            if (!ts) return "Unknown time";
                            const d = new Date(ts);
                            return isNaN(d.getTime()) ? "Unknown time" : formatDistanceToNow(d, { addSuffix: true });
                          })()}
                        </div>
                      </div>
                      {execution.cost && (
                        <div className="text-sm font-medium text-gray-900">
                          ${execution.cost}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      prompt.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                      prompt.status === "DRAFT" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {prompt.status}
                    </span>
                  </dd>
                </div>
                {prompt.category && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Category</dt>
                    <dd className="mt-1 text-sm text-gray-900">{prompt.category}</dd>
                  </div>
                )}
                {prompt.tags.length > 0 && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Tags</dt>
                    <dd className="mt-1 flex flex-wrap gap-1">
                      {prompt.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium text-gray-500">Version</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {prompt.current_version || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Created By</dt>
                  <dd className="mt-1 text-sm text-gray-900">{prompt.created_by_username}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDistanceToNow(new Date(prompt.updated_at), { addSuffix: true })}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/prompts/${promptId}/versions`)}
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ClockIcon className="mr-3 h-5 w-5 text-gray-400" />
                  Version History
                </button>
                <button
                  onClick={() => router.push(`/analytics/${promptId}`)}
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ChartBarIcon className="mr-3 h-5 w-5 text-gray-400" />
                  Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
