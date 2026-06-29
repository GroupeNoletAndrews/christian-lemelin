"use client"

import { AdminProvider } from "@/lib/admin-context"
import { AdminQuickAccess } from "@/components/admin/AdminQuickAccess"

export function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      {children}
      <AdminQuickAccess />
    </AdminProvider>
  )
}
