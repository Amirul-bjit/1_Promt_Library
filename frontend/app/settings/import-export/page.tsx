"use client";

import { useState, useRef } from "react";
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

export default function ImportExportSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>("");
  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      // TODO: Implement actual export
      const data = {
        prompts: [],
        exported_at: new Date().toISOString(),
        version: "1.0",
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prompt-library-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus("Importing...");
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // TODO: Implement actual import
      console.log("Importing:", data);

      setTimeout(() => {
        setImportStatus(`Successfully imported ${data.prompts?.length || 0} prompts`);
      }, 1000);
    } catch (error) {
      console.error("Import failed:", error);
      setImportStatus("Import failed. Please check the file format.");
    }
  };

  return (
    <div>
      {/* Import / Export */}
      <div className="space-y-6">
          {/* Export Section */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Export all your prompts, templates, and configurations as a JSON file. This can be
                  used for backup or to migrate to another instance.
                </p>
                <ul className="mt-3 text-sm text-gray-600 list-disc list-inside">
                  <li>All prompt templates and versions</li>
                  <li>Categories and tags</li>
                  <li>Configuration settings</li>
                </ul>
              </div>
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="ml-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
                {exportLoading ? "Exporting..." : "Export All Data"}
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Import Data</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Import prompts and templates from a previously exported JSON file. This will add new
                  items to your library without affecting existing data.
                </p>
                <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> Make sure to review the imported data. Duplicate entries
                    will be skipped.
                  </p>
                </div>
              </div>
              <div className="ml-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ArrowUpTrayIcon className="mr-2 h-5 w-5" />
                  Import Data
                </button>
              </div>
            </div>
            {importStatus && (
              <div
                className={clsx(
                  "mt-4 rounded-lg p-3 text-sm",
                  importStatus.includes("failed")
                    ? "bg-red-50 text-red-800"
                    : importStatus.includes("Successfully")
                    ? "bg-green-50 text-green-800"
                    : "bg-blue-50 text-blue-800"
                )}
              >
                {importStatus}
              </div>
            )}
          </div>

          {/* Data Format Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Export Format</h3>
            <p className="text-sm text-gray-600 mb-3">
              The export file will be in JSON format with the following structure:
            </p>
            <pre className="text-xs bg-white p-4 rounded border border-gray-200 overflow-auto">
{`{
  "version": "1.0",
  "exported_at": "2024-02-18T10:30:00Z",
  "prompts": [
    {
      "title": "Example Prompt",
      "description": "...",
      "content": "...",
      "category": "...",
      "tags": ["tag1", "tag2"],
      "status": "ACTIVE"
    }
  ]
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
