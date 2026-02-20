"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, EyeIcon, ArrowUturnLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PromptVersion } from "@/types";
import { safeFormatDistanceToNow, safeFormat } from "@/lib/dateUtils";

export default function VersionHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const promptId = resolvedParams.id;

  const [previewVersion, setPreviewVersion] = useState<PromptVersion | null>(null);
  const [restoring, setRestoring] = useState<number | null>(null);

  const { data: versions = [], isLoading } = useQuery<PromptVersion[]>({
    queryKey: ["prompt-versions", promptId],
    queryFn: async () => {
      const response = await api.get(`/prompts/templates/${promptId}/versions/`);
      return response.data;
    },
  });

  const handleRestore = async (version: PromptVersion) => {
    if (!confirm(`Restore v${version.version_number}? This creates a new version with the same content.`)) return;
    setRestoring(version.id);
    try {
      await api.post(`/prompts/versions/${version.id}/restore/`);
      await queryClient.invalidateQueries({ queryKey: ["prompt-versions", promptId] });
      await queryClient.invalidateQueries({ queryKey: ["prompt", promptId] });
      router.push(`/prompts/${promptId}`);
    } catch (error) {
      console.error("Failed to restore version:", error);
      alert("Failed to restore version. Please try again.");
    } finally {
      setRestoring(null);
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
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-4">
            {versions.map((version, index) => (
              <div key={version.id} className="relative flex gap-5">
              <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold mt-1 ${
                index === 0 ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300 bg-white text-gray-600"
              }`}>v{version.version_number}</div>
              <div className="flex-1 rounded-lg border border-gray-200 bg-white p-5 shadow-sm mb-3">
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
                    <p className="mt-0.5 text-xs text-gray-500">
                      By <span className="font-medium text-gray-700">{version.created_by_username}</span> &middot;{" "}
                      <span title={safeFormat(version.created_at, "PPpp")}>{safeFormatDistanceToNow(version.created_at)}</span>
                    </p>
                    {version.change_notes && (
                      <p className="mt-2 text-sm text-gray-700">{version.change_notes}</p>
                    )}
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <button
                      onClick={() => setPreviewVersion(version)}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <EyeIcon className="mr-1 h-3.5 w-3.5" />Preview
                    </button>
                    {index !== 0 && (
                      <button
                        onClick={() => handleRestore(version)}
                        disabled={restoring === version.id}
                        className="inline-flex items-center rounded-md border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                      >
                        <ArrowUturnLeftIcon className="mr-1 h-3.5 w-3.5" />
                        {restoring === version.id ? "Restoring..." : "Restore"}
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
              </div>
            ))}
            </div>
          </div>
        )}
      </div>

      {previewVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreviewVersion(null)} />
          <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Version {previewVersion.version_number}</h2>
                <p className="text-xs text-gray-500 mt-0.5">By {previewVersion.created_by_username} &middot; {safeFormat(previewVersion.created_at, "PPpp")}</p>
              </div>
              <button onClick={() => setPreviewVersion(null)} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {previewVersion.change_notes && (
              <div className="border-b border-gray-100 bg-amber-50 px-6 py-3 text-sm text-amber-800 italic">&ldquo;{previewVersion.change_notes}&rdquo;</div>
            )}
            <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">{previewVersion.content}</pre>
            </div>
            {previewVersion.variables.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Variables</p>
                <div className="flex flex-wrap gap-1.5">
                  {previewVersion.variables.map((v: string, i: number) => (
                    <span key={i} className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{`{{${v}}}`}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button onClick={() => setPreviewVersion(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
