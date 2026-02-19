"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";

interface VariableChipEditorProps {
  content: string;
  onChange?: (content: string) => void;
  readonly?: boolean;
  className?: string;
}

export default function VariableChipEditor({
  content,
  onChange,
  readonly = false,
  className,
}: VariableChipEditorProps) {
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onChange?.(newContent);
  };

  // Extract variables from content (matches {{variableName}})
  const extractVariables = (text: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1].trim());
    }
    return [...new Set(matches)]; // Remove duplicates
  };

  const variables = extractVariables(localContent);

  // Render content with highlighted variables
  const renderHighlightedContent = () => {
    if (!localContent) return null;

    const parts = localContent.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, index) => {
      if (part.match(/^\{\{[^}]+\}\}$/)) {
        const varName = part.slice(2, -2).trim();
        return (
          <span
            key={index}
            className="inline-flex items-center rounded-md bg-indigo-100 px-2 py-0.5 text-sm font-medium text-indigo-800"
          >
            {varName}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={clsx("space-y-3", className)}>
      {readonly ? (
        <div className="min-h-[200px] whitespace-pre-wrap rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm text-gray-900">
          {renderHighlightedContent()}
        </div>
      ) : (
        <textarea
          value={localContent}
          onChange={handleChange}
          className="w-full min-h-[200px] rounded-lg border border-gray-300 p-3 font-mono text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter your prompt template here. Use {{variable_name}} for variables."
        />
      )}

      {variables.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Detected Variables:
          </div>
          <div className="flex flex-wrap gap-2">
            {variables.map((variable, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-800"
              >
                {variable}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
