"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  DocumentTextIcon,
  PlayIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "@/lib/store/authStore";
import { clsx } from "clsx";

const navigation = [
  { name: "Prompt Library", href: "/prompts", icon: HomeIcon },
  { name: "Execution History", href: "/executions", icon: PlayIcon },
  { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
  { name: "Audit Log", href: "/audit", icon: ClipboardDocumentListIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Link href="/prompts" className="flex items-center space-x-2">
          <DocumentTextIcon className="h-8 w-8 text-indigo-500" />
          <span className="text-xl font-bold text-white">Prompt Library</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon
                className={clsx(
                  "mr-3 h-6 w-6 flex-shrink-0",
                  isActive ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-300"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-800 p-4">
        <div className="mb-2 text-sm text-gray-400">
          {user?.username || "Guest"}
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
