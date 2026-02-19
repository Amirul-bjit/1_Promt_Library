"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, EyeIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { PromptVersion } from "@/types";
import { formatDistanceToNow } from "date-fns";

export default function VersionHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const promptId = resolvedParams.id;

  const { data: versions = [], isLoading } = useQuery<PromptVersion[]>({
    queryKey: ["prompt-versions", promptId],
    queryFn: async () => {
      const response = await api.get(`/prompts/templates/${promptId}/versions/`);
      return response.data;
    },
  });

  const handleRestore = async (versionId: number) => {
    if (confirm("Are you sure you want to restore this version?")) {
      try {
        await api.post(`/prompts/templates/${promptId}/versions/${versionId}/restore/`);
        router.push(`/prompts/${promptId}`);
      } catch (error) {
        console.error("Failed to restore version:", error);
        alert("Failed to restore version. Please try again.");
      }
    }
  };

  const handleCompare = (v1: number, v2: number) => {
    router.push(`/prompts/${promptId}/versions/${v1}/diff/${v2}`);
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
            <h1 className="text-3xl font-bold text-gray-900">Version History</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-500">Loading versions...</div>
          </div>
        ) : versions.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">No versions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Version {version.version_number}
                      </h3>
                      {index === 0 && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      By {version.created_by_username} •{" "}
                      {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                    </p>
                    {version.change_notes && (
                      <p className="mt-2 text-sm text-gray-700">{version.change_notes}</p>
                    )}
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <button
                      onClick={() => {
                        // TODO: Show preview modal
                        console.log("Preview version", version.id);
                      }}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <EyeIcon className="mr-1 h-4 w-4" />
                      Preview
                    </button>
                    {index !== 0 && (
                      <button
                        onClick={() => handleRestore(version.id)}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <ArrowUturnLeftIcon className="mr-1 h-4 w-4" />
                        Restore
                      </button>
                    )}
                    {index < versions.length - 1 && (
                      <button
                        onClick={() =>
                          handleCompare(version.version_number, versions[index + 1].version_number)
                        }
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                      >
                        Compare
                      </button>
                    )}
                  </div>
                </div>

                {/* Variables */}
                {version.variables.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-medium text-gray-500 mb-2">Variables:</div>
                    <div className="flex flex-wrap gap-2">
                      {version.variables.map((variable, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Preview */}
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="font-mono text-xs text-gray-700 line-clamp-3">
                    {version.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
