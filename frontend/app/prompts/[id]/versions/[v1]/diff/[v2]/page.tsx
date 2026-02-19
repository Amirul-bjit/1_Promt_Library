"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { PromptVersion } from "@/types";
import DiffViewer from "@/components/shared/DiffViewer";

export default function VersionDiffPage({
  params,
}: {
  params: Promise<{ id: string; v1: string; v2: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { id: promptId, v1, v2 } = resolvedParams;

  const { data: version1, isLoading: loading1 } = useQuery<PromptVersion>({
    queryKey: ["prompt-version", promptId, v1],
    queryFn: async () => {
      const response = await api.get(`/prompts/templates/${promptId}/versions/`);
      const versions = response.data;
      return versions.find((v: PromptVersion) => v.version_number === parseInt(v1));
    },
  });

  const { data: version2, isLoading: loading2 } = useQuery<PromptVersion>({
    queryKey: ["prompt-version", promptId, v2],
    queryFn: async () => {
      const response = await api.get(`/prompts/templates/${promptId}/versions/`);
      const versions = response.data;
      return versions.find((v: PromptVersion) => v.version_number === parseInt(v2));
    },
  });

  const isLoading = loading1 || loading2;

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
              <h1 className="text-3xl font-bold text-gray-900">Version Comparison</h1>
              <p className="text-sm text-gray-500 mt-1">
                Comparing version {v1} with version {v2}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-500">Loading comparison...</div>
          </div>
        ) : !version1 || !version2 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">Version not found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Metadata Comparison */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Version Details</h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Version {v1}</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-xs text-gray-500">Author</dt>
                      <dd className="text-sm text-gray-900">{version1.created_by_username}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Date</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(version1.created_at).toLocaleString()}
                      </dd>
                    </div>
                    {version1.change_notes && (
                      <div>
                        <dt className="text-xs text-gray-500">Notes</dt>
                        <dd className="text-sm text-gray-900">{version1.change_notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Version {v2}</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-xs text-gray-500">Author</dt>
                      <dd className="text-sm text-gray-900">{version2.created_by_username}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Date</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(version2.created_at).toLocaleString()}
                      </dd>
                    </div>
                    {version2.change_notes && (
                      <div>
                        <dt className="text-xs text-gray-500">Notes</dt>
                        <dd className="text-sm text-gray-900">{version2.change_notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>

            {/* Content Diff */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Changes</h2>
              <DiffViewer
                oldContent={version2.content}
                newContent={version1.content}
                oldLabel={`Version ${v2}`}
                newLabel={`Version ${v1}`}
                mode="side-by-side"
              />
            </div>

            {/* Variables Comparison */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Variables</h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Version {v1}</h3>
                  <div className="flex flex-wrap gap-2">
                    {version1.variables.map((variable, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800"
                      >
                        {variable}
                      </span>
                    ))}
                    {version1.variables.length === 0 && (
                      <span className="text-sm text-gray-500">No variables</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Version {v2}</h3>
                  <div className="flex flex-wrap gap-2">
                    {version2.variables.map((variable, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800"
                      >
                        {variable}
                      </span>
                    ))}
                    {version2.variables.length === 0 && (
                      <span className="text-sm text-gray-500">No variables</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
