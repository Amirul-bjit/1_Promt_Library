"use client";

import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, ClipboardDocumentIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import api from "@/lib/api";

interface APIKey {
  id: number;
  name: string;
  key_prefix: string;
  raw_key?: string | null;
  created_at: string;
  last_used_at: string | null;
}

export default function APIKeysSettingsPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await api.get("/prompts/api-keys/");
      const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
      setApiKeys(data);
    } catch (err) {
      console.error("Failed to fetch API keys:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await api.post("/prompts/api-keys/", { name: newKeyName.trim() });
      const created: APIKey = res.data;
      setRevealedKey(created.raw_key ?? null);
      setApiKeys((prev) => [created, ...prev]);
      setNewKeyName("");
      setShowNewKeyForm(false);
    } catch (err) {
      console.error("Failed to create API key:", err);
      alert("Failed to create key. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (!confirm("Delete this API key? Any integrations using it will stop working.")) return;
    try {
      await api.delete(`/prompts/api-keys/${id}/`);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      console.error("Failed to delete API key:", err);
      alert("Failed to delete key.");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* New-key revealed banner */}
      {revealedKey && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800 mb-2">
            Copy your new API key now — it will not be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-white border border-green-200 px-3 py-2 text-sm font-mono text-gray-800 break-all">
              {revealedKey}
            </code>
            <button
              onClick={() => handleCopy(revealedKey)}
              className="shrink-0 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={() => setRevealedKey(null)}
              className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage keys for programmatic access to your prompt library.
          </p>
        </div>
        <button
          onClick={() => setShowNewKeyForm(true)}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <PlusIcon className="mr-2 h-5 w-5" />
          Create New Key
        </button>
      </div>

      {/* New Key Form */}
      {showNewKeyForm && (
        <div className="rounded-lg border-2 border-indigo-500 bg-white p-6 shadow">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Create New API Key</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Production Key"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateKey}
                disabled={creating || !newKeyName.trim()}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? "Creating…" : "Create Key"}
              </button>
              <button
                onClick={() => { setShowNewKeyForm(false); setNewKeyName(""); }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keys List */}
      <div className="rounded-lg bg-white shadow overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading…</div>
        ) : apiKeys.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No API keys yet. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((k) => (
                  <tr key={k.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{k.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-gray-600 font-mono">{k.key_prefix}••••••••</code>
                        <button
                          onClick={() => handleCopy(k.key_prefix)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy prefix"
                        >
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(k.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteKey(k.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
