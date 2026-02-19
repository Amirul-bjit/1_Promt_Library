"use client";

import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import api from "@/lib/api";

interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await api.get("/prompts/tags/");
      // Ensure we're setting an array
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || []);
      setTags(data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({ name: tag.name });
    } else {
      setEditingTag(null);
      setFormData({ name: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
    setFormData({ name: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await api.put(`/prompts/tags/${editingTag.id}/`, formData);
      } else {
        await api.post("/prompts/tags/", formData);
      }
      fetchTags();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save tag:", error);
      alert("Failed to save tag. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    
    try {
      await api.delete(`/prompts/tags/${id}/`);
      fetchTags();
    } catch (error) {
      console.error("Failed to delete tag:", error);
      alert("Failed to delete tag. It may be in use by templates.");
    }
  };

  return (
    <div>
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tags</h2>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5" />
          New Tag
        </button>
      </div>

      {/* Content */}
      <div>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading tags...</p>
          </div>
        ) : !Array.isArray(tags) || tags.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No tags yet</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
            >
              <PlusIcon className="h-5 w-5" />
              Create your first tag
            </button>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {Array.isArray(tags) && tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm text-indigo-800"
                  >
                    <span className="font-medium">{tag.name}</span>
                    <button
                      onClick={() => handleOpenModal(tag)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Table view for larger screens */}
            <table className="hidden sm:table min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(tags) && tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                          {tag.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(tag.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(tag)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <PencilIcon className="h-5 w-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="relative z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={handleCloseModal}
          />
          {/* Dialog */}
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {editingTag ? "Edit Tag" : "New Tag"}
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tag Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., email, marketing, ai"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use lowercase and hyphens for multi-word tags
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto"
                  >
                    {editingTag ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
