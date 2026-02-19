"use client";

import Link from "next/link";
import {
  Cog6ToothIcon,
  TagIcon,
  FolderIcon,
  KeyIcon,
  CloudIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

const settingsGroups = [
  {
    title: "Content Management",
    description: "Manage your prompt library structure",
    items: [
      {
        name: "Categories",
        description: "Create and manage prompt categories",
        href: "/settings/categories",
        icon: FolderIcon,
      },
      {
        name: "Tags",
        description: "Create and manage tags for prompts",
        href: "/settings/tags",
        icon: TagIcon,
      },
    ],
  },
  {
    title: "Integrations",
    description: "Configure external services and API keys",
    items: [
      {
        name: "LLM Providers",
        description: "Configure OpenAI, Anthropic, and other LLM providers",
        href: "/settings/providers",
        icon: CloudIcon,
      },
      {
        name: "API Keys",
        description: "Manage your API keys and authentication",
        href: "/settings/api-keys",
        icon: KeyIcon,
      },
    ],
  },
  {
    title: "Data Management",
    description: "Import and export your data",
    items: [
      {
        name: "Import / Export",
        description: "Backup and restore your prompt library",
        href: "/settings/import-export",
        icon: ArrowDownTrayIcon,
      },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Cog6ToothIcon className="h-8 w-8 text-gray-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your prompt library and integrations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {settingsGroups.map((group) => (
            <div key={group.title}>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
                <p className="text-sm text-gray-500">{group.description}</p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group relative flex flex-col rounded-lg border border-gray-300 bg-white p-6 hover:border-indigo-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <item.icon className="h-6 w-6 text-gray-400 group-hover:text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 group-hover:text-indigo-600">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Configure
                      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Info</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-sm text-gray-500">System Status</div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-lg font-semibold text-gray-900">Operational</span>
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Last Backup</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">Never</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Storage Used</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">-</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
