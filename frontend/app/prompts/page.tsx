"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon } from "@heroicons/react/24/outline";
import PromptCard from "@/components/prompts/PromptCard";
import { Prompt } from "@/types";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function PromptsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("updated_at");

  const { data: prompts = [], isLoading } = useQuery<Prompt[]>({
    queryKey: ["prompts", searchQuery, statusFilter, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      params.append("ordering", sortBy);
      
      const response = await api.get(`/prompts/templates/?${params.toString()}`);
      
      // Handle both paginated and non-paginated responses
      if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
  });

  const handleRun = (id: number) => {
    router.push(`/prompts/${id}/run`);
  };

  const handleDuplicate = async (id: number) => {
    // TODO: Implement duplicate
    console.log("Duplicate prompt", id);
  };

  const handleArchive = async (id: number) => {
    // TODO: Implement archive
    console.log("Archive prompt", id);
  };

  const handleToggleFavorite = async (id: number) => {
    // TODO: Implement favorite toggle
    console.log("Toggle favorite", id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Prompt Library</h1>
            <button
              onClick={() => router.push("/prompts/new")}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              Create New Template
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="-updated_at">Recently Updated</option>
              <option value="-created_at">Recently Created</option>
              <option value="title">Name (A-Z)</option>
              <option value="-title">Name (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Prompts Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-500">Loading prompts...</div>
          </div>
        ) : prompts.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first prompt template.</p>
            <button
              onClick={() => router.push("/prompts/new")}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              Create New Template
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onRun={handleRun}
                onDuplicate={handleDuplicate}
                onArchive={handleArchive}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
