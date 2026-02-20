"use client";

import { useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);

  // List of paths that don't need authentication
  const publicPaths = ["/", "/login", "/register"];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated && !publicPaths.includes(pathname || "")) {
      router.push("/login");
    }
  }, [isAuthenticated, pathname, router, mounted]);

  // Before client mount, render children only — matches the server render
  // and avoids the hydration mismatch from store rehydration.
  if (!mounted || publicPaths.includes(pathname || "") || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
    </div>
  );
}
