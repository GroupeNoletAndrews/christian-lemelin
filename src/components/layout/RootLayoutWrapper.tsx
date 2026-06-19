"use client"

import { AdminProvider } from "@/lib/admin-context"

export function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <AdminProvider>{children}</AdminProvider>
}
