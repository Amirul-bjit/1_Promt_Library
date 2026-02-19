"use client";

import Link from "next/link";
import { Prompt } from "@/types";
import {
  PlayIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  HeartIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";

interface PromptCardProps {
  prompt: Prompt;
  onRun?: (id: number) => void;
  onDuplicate?: (id: number) => void;
  onArchive?: (id: number) => void;
  onToggleFavorite?: (id: number) => void;
}

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  DRAFT: "bg-yellow-100 text-yellow-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};

export default function PromptCard({
  prompt,
  onRun,
  onDuplicate,
  onArchive,
  onToggleFavorite,
}: PromptCardProps) {
  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <Link
            href={`/prompts/${prompt.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
          >
            {prompt.title}
          </Link>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {prompt.description}
          </p>
        </div>
        <button
          onClick={() => onToggleFavorite?.(prompt.id)}
          className="ml-2 text-gray-400 hover:text-red-500"
        >
          {prompt.is_favorited ? (
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Metadata */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className={clsx(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusColors[prompt.status]
          )}
        >
          {prompt.status}
        </span>
        {prompt.category && (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            {prompt.category}
          </span>
        )}
        {prompt.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
          >
            {tag}
          </span>
        ))}
        {prompt.tags.length > 3 && (
          <span className="text-xs text-gray-500">
            +{prompt.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center text-xs text-gray-500">
          <ClockIcon className="mr-1 h-4 w-4" />
          {formatDistanceToNow(new Date(prompt.updated_at), { addSuffix: true })}
        </div>
        <div className="flex items-center space-x-2">
          {prompt.status !== "ARCHIVED" && (
            <>
              <button
                onClick={() => onRun?.(prompt.id)}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                title="Run"
              >
                <PlayIcon className="mr-1 h-4 w-4" />
                Run
              </button>
              <button
                onClick={() => onDuplicate?.(prompt.id)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                title="Duplicate"
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onArchive?.(prompt.id)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                title="Archive"
              >
                <ArchiveBoxIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Version info */}
      {prompt.current_version && (
        <div className="mt-2 text-xs text-gray-500">
          v{prompt.current_version} • {prompt.versions_count} version
          {prompt.versions_count !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
