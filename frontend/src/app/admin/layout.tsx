"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdmin } from "@/lib/admin-context";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, authLoading } = useAdmin();

  useEffect(() => {
    // Redirect to login if not authenticated and not on login page — but only
    // after the initial session check, so a refresh doesn't bounce a logged-in
    // user before getUser() restores the persisted Supabase session.
    if (!authLoading && !isAuthenticated && pathname !== "/admin") {
      router.push("/admin");
    }
  }, [authLoading, isAuthenticated, pathname, router]);

  return children;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
