"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function TemplateAnalyticsPage({ params }: { params: Promise<{ templateId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const templateId = resolvedParams.templateId;

  const { data: prompt } = useQuery({
    queryKey: ["prompt", templateId],
    queryFn: async () => {
      const response = await api.get(`/prompts/templates/${templateId}/`);
      return response.data;
    },
  });

  const { data: executions = [] } = useQuery({
    queryKey: ["executions", templateId],
    queryFn: async () => {
      const response = await api.get(`/executions/?prompt=${templateId}`);
      return response.data.results || response.data;
    },
  });

  // Calculate stats
  const totalExecutions = executions.length;
  const completedExecutions = executions.filter((e: any) => e.status === "COMPLETED").length;
  const failedExecutions = executions.filter((e: any) => e.status === "FAILED").length;
  const totalTokens = executions.reduce((sum: number, e: any) => sum + (e.tokens_used || 0), 0);
  const totalCost = executions.reduce((sum: number, e: any) => sum + parseFloat(e.cost || 0), 0);
  const avgDuration = executions.length > 0
    ? executions.reduce((sum: number, e: any) => sum + (e.duration_ms || 0), 0) / executions.length
    : 0;

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
              <h1 className="text-3xl font-bold text-gray-900">Template Analytics</h1>
              <p className="text-sm text-gray-500 mt-1">{prompt?.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">Total Executions</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{totalExecutions}</div>
            <div className="mt-1 text-xs text-gray-500">
              {completedExecutions} completed, {failedExecutions} failed
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">Success Rate</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {totalExecutions > 0 ? ((completedExecutions / totalExecutions) * 100).toFixed(1) : 0}%
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">Total Tokens</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{totalTokens.toLocaleString()}</div>
            <div className="mt-1 text-xs text-gray-500">
              Avg: {totalExecutions > 0 ? Math.round(totalTokens / totalExecutions) : 0}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">Total Cost</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">${totalCost.toFixed(2)}</div>
            <div className="mt-1 text-xs text-gray-500">
              Avg: ${totalExecutions > 0 ? (totalCost / totalExecutions).toFixed(4) : "0.00"}
            </div>
          </div>
        </div>

        {/* Recent Executions */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Executions</h2>
          {executions.length === 0 ? (
            <p className="text-sm text-gray-500">No executions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Provider / Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tokens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {executions.slice(0, 10).map((execution: any) => (
                    <tr
                      key={execution.id}
                      onClick={() => router.push(`/executions/${execution.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{execution.provider}</div>
                        <div className="text-xs text-gray-500">{execution.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            execution.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : execution.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {execution.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {execution.tokens_used || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${execution.cost || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {execution.duration_ms ? `${execution.duration_ms}ms` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(execution.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Performance Stats */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {avgDuration.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-500 mt-1">Average Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {totalExecutions > 0 ? Math.round(totalTokens / totalExecutions) : 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Avg Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {prompt?.versions_count || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Total Versions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
