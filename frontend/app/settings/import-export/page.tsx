"use client";

import { useState, useRef } from "react";
import { ArrowDownTrayIcon, ArrowUpTrayIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import api from "@/lib/api";

type ImportStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; imported: number; skipped: number }
  | { type: "error"; message: string };

export default function ImportExportSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>({ type: "idle" });
  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await api.get("/prompts/templates/export/");
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
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
    // reset input so the same file can be re-selected
    event.target.value = "";

    setImportStatus({ type: "loading" });
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await api.post("/prompts/templates/import/", data);
      setImportStatus({
        type: "success",
        imported: res.data.imported,
        skipped: res.data.skipped,
      });
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ??
        error?.message ??
        "Import failed. Please check the file format.";
      setImportStatus({ type: "error", message: msg });
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
            <p className="text-sm text-gray-500 mt-2">
              Export all your prompts, templates, and configurations as a JSON file.
              Use this for backup or to migrate to another instance.
            </p>
            <ul className="mt-3 text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>All prompt templates and their latest version</li>
              <li>Categories and tags</li>
            </ul>
          </div>
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="ml-6 shrink-0 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
            {exportLoading ? "Exporting…" : "Export All Data"}
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Import Data</h3>
            <p className="text-sm text-gray-500 mt-2">
              Import prompts from a previously exported JSON file. New items are
              added; duplicates (same title) are skipped.
            </p>
            <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Prompts with the same title as an existing
                one will be skipped automatically.
              </p>
            </div>
          </div>
          <div className="ml-6 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importStatus.type === "loading"}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowUpTrayIcon className="mr-2 h-5 w-5" />
              {importStatus.type === "loading" ? "Importing…" : "Import Data"}
            </button>
          </div>
        </div>

        {/* Import result */}
        {importStatus.type === "success" && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
            <span>
              Imported <strong>{importStatus.imported}</strong> prompt
              {importStatus.imported !== 1 ? "s" : ""}.
              {importStatus.skipped > 0 && ` ${importStatus.skipped} duplicate(s) skipped.`}
            </span>
          </div>
        )}
        {importStatus.type === "error" && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <XCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>

      {/* Format reference */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Export Format</h3>
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
      "status": "active"
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
}
