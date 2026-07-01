"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdmin } from "@/lib/admin-context";
import { FeedbackProvider } from "@/components/admin/FeedbackProvider";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, authLoading, mustChangePassword } = useAdmin();

  useEffect(() => {
    // Wait for the initial session check, so a refresh doesn't bounce a logged-in
    // user before getUser() restores the persisted Supabase session.
    if (authLoading) return;
    if (!isAuthenticated) {
      // Not signed in → login. The content workspace is excluded: it handles its
      // own auth-loss redirect so it can warn about unpublished edits first (a
      // blanket redirect here would discard them).
      if (pathname !== "/admin" && pathname !== "/admin/dashboard/content") {
        router.push("/admin");
      }
      return;
    }
    // Signed in with a temporary password → force the change before anything else.
    if (mustChangePassword && pathname !== "/admin/change-password") {
      router.replace("/admin/change-password");
    }
  }, [authLoading, isAuthenticated, mustChangePassword, pathname, router]);

  // FeedbackProvider gives every admin screen on-brand confirm/toast popups.
  return <FeedbackProvider>{children}</FeedbackProvider>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
