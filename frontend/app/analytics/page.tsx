"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardMetrics } from "@/types";

export default function AnalyticsPage() {
  const router = useRouter();

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["analytics-dashboard"],
    queryFn: async () => {
      const response = await api.get("/analytics/dashboard_metrics/");
      return response.data;
    },
  });

  const { data: topPrompts = [] } = useQuery({
    queryKey: ["top-prompts"],
    queryFn: async () => {
      const response = await api.get("/prompts/templates/?ordering=-versions_count&limit=5");
      return response.data.results || response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">Total Executions</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {metrics?.total_executions || 0}
            </div>
            <div className="mt-1 text-xs text-green-600">
              {metrics?.successful_executions || 0} successful
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">Success Rate</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {metrics?.success_rate ? `${(metrics.success_rate * 100).toFixed(1)}%` : "0%"}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {metrics?.failed_executions || 0} failed
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">Total Tokens</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {(metrics?.total_tokens || 0).toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-gray-500">Across all executions</div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">Total Cost</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              ${(metrics?.total_cost || 0).toFixed(2)}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Avg: ${metrics?.avg_duration_ms ? (metrics.total_cost / metrics.total_executions).toFixed(4) : "0.00"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Provider Breakdown */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Provider Breakdown</h2>
            {metrics?.provider_breakdown && Object.keys(metrics.provider_breakdown).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(metrics.provider_breakdown).map(([provider, count]) => {
                  const percentage = metrics.total_executions
                    ? ((count as number) / metrics.total_executions) * 100
                    : 0;
                  return (
                    <div key={provider}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{provider}</span>
                        <span className="text-sm text-gray-500">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No data available</p>
            )}
          </div>

          {/* Top Templates */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Templates by Usage</h2>
            {topPrompts.length > 0 ? (
              <div className="space-y-3">
                {topPrompts.map((prompt: any, index: number) => (
                  <div
                    key={prompt.id}
                    onClick={() => router.push(`/analytics/${prompt.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{prompt.title}</div>
                        <div className="text-xs text-gray-500">{prompt.category}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {prompt.versions_count} versions
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No templates available</p>
            )}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Stats</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {metrics?.avg_duration_ms ? `${metrics.avg_duration_ms.toFixed(0)}ms` : "-"}
              </div>
              <div className="text-sm text-gray-500 mt-1">Average Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {metrics?.total_tokens && metrics?.total_executions
                  ? Math.round(metrics.total_tokens / metrics.total_executions)
                  : 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Avg Tokens per Execution</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${metrics?.total_cost && metrics?.total_executions
                  ? (metrics.total_cost / metrics.total_executions).toFixed(4)
                  : "0.00"}
              </div>
              <div className="text-sm text-gray-500 mt-1">Avg Cost per Execution</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
