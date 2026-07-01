"use client"

import { AdminProvider } from "@/lib/admin-context"
import { AdminQuickAccess } from "@/components/admin/AdminQuickAccess"
import { PreviewNavigationLock } from "@/components/admin/PreviewNavigationLock"

export function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      {children}
      <AdminQuickAccess />
      <PreviewNavigationLock />
    </AdminProvider>
  )
}
