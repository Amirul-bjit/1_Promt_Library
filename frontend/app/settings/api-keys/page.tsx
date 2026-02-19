"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";

export default function APIKeysSettingsPage() {
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: "Production Key",
      key: "pk_live_1234567890abcdef",
      created: "2024-01-15",
      lastUsed: "2024-02-15",
    },
    {
      id: 2,
      name: "Development Key",
      key: "pk_test_abcdef1234567890",
      created: "2024-02-01",
      lastUsed: "2024-02-18",
    },
  ]);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;

    const newKey = {
      id: Date.now(),
      name: newKeyName,
      key: `pk_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "-",
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
    setShowNewKeyForm(false);
  };

  const handleDeleteKey = (id: number) => {
    if (confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      setApiKeys(apiKeys.filter((k) => k.id !== id));
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    alert("API key copied to clipboard!");
  };

  return (
    <div>
      {/* API Keys */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage API keys for programmatic access to your prompt library
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
              <h3 className="text-md font-semibold text-gray-900 mb-4">Create New API Key</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Production Key, Development Key"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateKey}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Create Key
                  </button>
                  <button
                    onClick={() => {
                      setShowNewKeyForm(false);
                      setNewKeyName("");
                    }}
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
            {apiKeys.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No API keys yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        API Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Last Used
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiKeys.map((apiKey) => (
                      <tr key={apiKey.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <code className="text-sm text-gray-600 font-mono">
                              {apiKey.key}
                            </code>
                            <button
                              onClick={() => handleCopyKey(apiKey.key)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Copy to clipboard"
                            >
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {apiKey.created}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {apiKey.lastUsed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteKey(apiKey.id)}
                            className="text-red-600 hover:text-red-700"
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
      </div>
    </div>
  );
}
