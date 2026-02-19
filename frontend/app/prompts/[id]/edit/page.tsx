"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import VariableChipEditor from "@/components/prompts/VariableChipEditor";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Prompt } from "@/types";

export default function EditPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const promptId = resolvedParams.id;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: prompt, isLoading } = useQuery<Prompt>({
    queryKey: ["prompt", promptId],
    queryFn: async () => {
      const response = await api.get(`/prompts/templates/${promptId}/`);
      return response.data;
    },
  });

  const [formData, setFormData] = useState({
    title: prompt?.title || "",
    description: prompt?.description || "",
    category: prompt?.category || "",
    tags: prompt?.tags.join(", ") || "",
    content: prompt?.current_version_data?.content || "",
    status: prompt?.status || "DRAFT",
    change_notes: "",
  });

  // Update form when prompt loads
  if (prompt && !formData.title) {
    setFormData({
      title: prompt.title,
      description: prompt.description,
      category: prompt.category,
      tags: prompt.tags.join(", "),
      content: prompt.current_version_data?.content || "",
      status: prompt.status,
      change_notes: "",
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.patch(`/prompts/templates/${promptId}/`, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        status: formData.status,
      });

      // Create new version if content changed
      if (formData.content !== prompt?.current_version_data?.content) {
        await api.post(`/prompts/templates/${promptId}/versions/`, {
          content: formData.content,
          change_notes: formData.change_notes,
        });
      }

      router.push(`/prompts/${promptId}`);
    } catch (error) {
      console.error("Failed to update prompt:", error);
      alert("Failed to update prompt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Template</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "DRAFT" | "ACTIVE" | "ARCHIVED" })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Prompt Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prompt Template *
                </label>
                <VariableChipEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                />
              </div>

              {/* Change Notes */}
              {formData.content !== prompt?.current_version_data?.content && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Change Notes
                  </label>
                  <textarea
                    value={formData.change_notes}
                    onChange={(e) => setFormData({ ...formData, change_notes: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe what changed in this version..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
