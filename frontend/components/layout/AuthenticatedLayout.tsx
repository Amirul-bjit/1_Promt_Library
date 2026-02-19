"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import Sidebar from "@/components/layout/Sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // List of paths that don't need authentication
  const publicPaths = ["/", "/login", "/register"];

  useEffect(() => {
    if (!isAuthenticated && !publicPaths.includes(pathname || "")) {
      router.push("/login");
    }
  }, [isAuthenticated, pathname, router]);

  // Don't show sidebar on public pages
  if (publicPaths.includes(pathname || "") || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
    </div>
  );
}
