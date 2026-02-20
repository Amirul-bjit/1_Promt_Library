"use client";

import { useState } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { safeFormatDistanceToNow, safeFormat } from "@/lib/dateUtils";
import type { AuditLog, AuditAction, PaginatedResponse } from "@/types";

const ACTION_COLORS: Record<AuditAction | "default", string> = {
  create: "bg-green-100 text-green-800",
  update: "bg-blue-100 text-blue-800",
  delete: "bg-red-100 text-red-800",
  restore: "bg-teal-100 text-teal-800",
  archive: "bg-yellow-100 text-yellow-800",
  execute: "bg-purple-100 text-purple-800",
  export: "bg-orange-100 text-orange-800",
  import: "bg-cyan-100 text-cyan-800",
  login: "bg-indigo-100 text-indigo-800",
  logout: "bg-gray-100 text-gray-600",
  default: "bg-gray-100 text-gray-800",
};

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery<PaginatedResponse<AuditLog>>({
    queryKey: ["audit-logs", searchQuery, actionFilter, dateFrom, dateTo, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (actionFilter !== "ALL") params.append("action", actionFilter);
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);
      params.append("page", String(page));

      const response = await api.get<PaginatedResponse<AuditLog>>(
        `/audit/logs/?${params.toString()}`
      );
      return response.data;
    },
  });

  const auditLogs = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleFilterChange = (value: string) => {
    setActionFilter(value);
    setPage(1);
  };

  const getActionColor = (action: AuditAction) =>
    ACTION_COLORS[action] ?? ACTION_COLORS.default;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
            <p className="mt-1 text-sm text-gray-500">
              {totalCount > 0
                ? `${totalCount.toLocaleString()} total entries`
                : "Track all system activity"}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-lg">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by user, IP, object..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400 shrink-0" />
            <select
              value={actionFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="restore">Restore</option>
              <option value="archive">Archive</option>
              <option value="execute">Execute</option>
              <option value="export">Export</option>
              <option value="import">Import</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 text-sm">
            <label className="text-gray-500 shrink-0">From</label>
            <input
              type="datetime-local"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
            <label className="text-gray-500 shrink-0">To</label>
            <input
              type="datetime-local"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg bg-white shadow overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : isError ? (
            <div className="p-12 text-center text-red-500">
              Failed to load audit logs. Make sure you have admin access.
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No audit logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 w-10" />
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Object
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <>
                      <tr key={log.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleRow(log.id)}>
                        <td className="px-4 py-4 text-gray-400">
                          {expandedRows.has(log.id) ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {log.user_username ?? <span className="italic text-gray-400">System</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getActionColor(log.action)}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.content_type_name ? (
                            <>
                              <div className="text-sm font-medium text-gray-900 capitalize">
                                {log.content_type_name}
                              </div>
                              {log.object_repr && (
                                <div className="text-xs text-gray-500 max-w-xs truncate">
                                  {log.object_repr}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-xs text-gray-400 italic">
                              {log.extra?.path as string ?? "—"}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div title={safeFormat(log.timestamp, "PPpp")}>
                            {safeFormatDistanceToNow(log.timestamp)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ip_address ?? "—"}
                        </td>
                      </tr>

                      {expandedRows.has(log.id) && (
                        <tr key={`${log.id}-expanded`}>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {/* Changes */}
                              {log.changes && Object.keys(log.changes).length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">
                                    Changes
                                  </h4>
                                  <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-auto max-h-48">
                                    {JSON.stringify(log.changes, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Extra metadata */}
                              {log.extra && Object.keys(log.extra).length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">
                                    Extra
                                  </h4>
                                  <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-auto max-h-48">
                                    {JSON.stringify(log.extra, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* User agent */}
                              {log.user_agent && (
                                <div className="sm:col-span-2">
                                  <h4 className="text-xs font-semibold text-gray-600 uppercase mb-1">
                                    User Agent
                                  </h4>
                                  <p className="text-xs text-gray-500 break-all">{log.user_agent}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} &mdash; {totalCount.toLocaleString()} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
