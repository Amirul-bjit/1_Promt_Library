"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const settingsTabs = [
  { name: "Categories", href: "/settings/categories" },
  { name: "Tags", href: "/settings/tags" },
  { name: "LLM Providers", href: "/settings/providers" },
  { name: "API Keys", href: "/settings/api-keys" },
  { name: "Import / Export", href: "/settings/import-export" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't show tabs on the main settings page
  if (pathname === "/settings") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {settingsTabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={clsx(
                  "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium",
                  pathname === tab.href
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
