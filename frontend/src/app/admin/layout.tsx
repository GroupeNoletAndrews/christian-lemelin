"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdmin } from "@/lib/admin-context";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAdmin();

  useEffect(() => {
    // Redirect to login if not authenticated and not on login page
    if (!isAuthenticated && pathname !== "/admin") {
      router.push("/admin");
    }
  }, [isAuthenticated, pathname, router]);

  return children;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
