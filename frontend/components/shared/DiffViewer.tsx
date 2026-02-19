"use client";

import { clsx } from "clsx";

interface DiffViewerProps {
  oldContent: string;
  newContent: string;
  oldLabel?: string;
  newLabel?: string;
  mode?: "side-by-side" | "inline";
}

export default function DiffViewer({
  oldContent,
  newContent,
  oldLabel = "Original",
  newLabel = "Modified",
  mode = "side-by-side",
}: DiffViewerProps) {
  // Simple diff algorithm - compares line by line
  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");

  const getDiffLines = () => {
    const maxLength = Math.max(oldLines.length, newLines.length);
    const diffs: Array<{
      old?: string;
      new?: string;
      type: "unchanged" | "added" | "removed" | "modified";
    }> = [];

    for (let i = 0; i < maxLength; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === newLine) {
        diffs.push({ old: oldLine, new: newLine, type: "unchanged" });
      } else if (oldLine === undefined) {
        diffs.push({ new: newLine, type: "added" });
      } else if (newLine === undefined) {
        diffs.push({ old: oldLine, type: "removed" });
      } else {
        diffs.push({ old: oldLine, new: newLine, type: "modified" });
      }
    }

    return diffs;
  };

  const diffs = getDiffLines();

  if (mode === "side-by-side") {
    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Left side - Old content */}
        <div className="rounded-lg border border-gray-300 bg-gray-50">
          <div className="border-b border-gray-300 bg-gray-100 px-4 py-2 font-medium text-gray-700">
            {oldLabel}
          </div>
          <div className="p-4 font-mono text-sm">
            {diffs.map((diff, index) => (
              <div
                key={`old-${index}`}
                className={clsx("px-2 py-0.5", {
                  "bg-red-100": diff.type === "removed" || diff.type === "modified",
                  "": diff.type === "unchanged",
                })}
              >
                {diff.old || " "}
              </div>
            ))}
          </div>
        </div>

        {/* Right side - New content */}
        <div className="rounded-lg border border-gray-300 bg-gray-50">
          <div className="border-b border-gray-300 bg-gray-100 px-4 py-2 font-medium text-gray-700">
            {newLabel}
          </div>
          <div className="p-4 font-mono text-sm">
            {diffs.map((diff, index) => (
              <div
                key={`new-${index}`}
                className={clsx("px-2 py-0.5", {
                  "bg-green-100": diff.type === "added" || diff.type === "modified",
                  "": diff.type === "unchanged",
                })}
              >
                {diff.new || " "}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Inline mode
  return (
    <div className="rounded-lg border border-gray-300 bg-gray-50">
      <div className="border-b border-gray-300 bg-gray-100 px-4 py-2 font-medium text-gray-700">
        {oldLabel} → {newLabel}
      </div>
      <div className="p-4 font-mono text-sm">
        {diffs.map((diff, index) => (
          <div key={index}>
            {diff.type === "removed" && (
              <div className="bg-red-100 px-2 py-0.5">
                <span className="text-red-600">- </span>
                {diff.old}
              </div>
            )}
            {diff.type === "added" && (
              <div className="bg-green-100 px-2 py-0.5">
                <span className="text-green-600">+ </span>
                {diff.new}
              </div>
            )}
            {diff.type === "modified" && (
              <>
                <div className="bg-red-100 px-2 py-0.5">
                  <span className="text-red-600">- </span>
                  {diff.old}
                </div>
                <div className="bg-green-100 px-2 py-0.5">
                  <span className="text-green-600">+ </span>
                  {diff.new}
                </div>
              </>
            )}
            {diff.type === "unchanged" && (
              <div className="px-2 py-0.5">
                <span className="text-gray-400">  </span>
                {diff.old}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
