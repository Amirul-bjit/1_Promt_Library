"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import VariableChipEditor from "@/components/prompts/VariableChipEditor";
import api from "@/lib/api";

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

export default function NewPromptPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    content: "",
    status: "active",
  });

  // Fetch categories and tags on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          api.get("/prompts/categories/"),
          api.get("/prompts/tags/"),
        ]);
        
        // Ensure we're setting arrays
        const categoriesData = Array.isArray(categoriesRes.data) 
          ? categoriesRes.data 
          : (categoriesRes.data?.results || []);
        const tagsData = Array.isArray(tagsRes.data) 
          ? tagsRes.data 
          : (tagsRes.data?.results || []);
          
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error("Failed to fetch categories/tags:", error);
        // Keep empty arrays on error
        setCategories([]);
        setTags([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post("/prompts/templates/", {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        status: formData.status,
        content: formData.content,
      });

      router.push(`/prompts/${response.data.id}`);
    } catch (error) {
      console.error("Failed to create prompt:", error);
      alert("Failed to create prompt. Please try again.");
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Template</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoadingData ? (
          <div className="rounded-lg bg-white p-6 shadow text-center">
            <p className="text-gray-500">Loading categories and tags...</p>
          </div>
        ) : (
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Email Subject Line Generator"
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Brief description of what this prompt does..."
                />
              </div>

              {/* Category and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="categories-list"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Marketing, Development"
                    />
                    <datalist id="categories-list">
                      {Array.isArray(categories) && categories.map((cat) => (
                        <option key={cat.id} value={cat.name} />
                      ))}
                    </datalist>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Select existing or type new category
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
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
                  list="tags-list"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Comma-separated tags, e.g., email, marketing, creative"
                />
                <datalist id="tags-list">
                  {Array.isArray(tags) && tags.map((tag) => (
                    <option key={tag.id} value={tag.name} />
                  ))}
                </datalist>
                <p className="mt-1 text-xs text-gray-500">
                  Separate multiple tags with commas. Select existing or create new ones.
                </p>
                {Array.isArray(tags) && tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-xs text-gray-500">Existing tags:</span>
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          const currentTags = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
                          if (!currentTags.includes(tag.name)) {
                            setFormData({
                              ...formData,
                              tags: [...currentTags, tag.name].join(", "),
                            });
                          }
                        }}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 hover:bg-gray-200"
                      >
                        + {tag.name}
                      </button>
                    ))}
                  </div>
                )}
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
                <p className="mt-1 text-xs text-gray-500">
                  Use {"{{"} and {"}}"} to define variables, e.g., {"{{product_name}}"}
                </p>
              </div>
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
              {isSubmitting ? "Creating..." : "Create Template"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
