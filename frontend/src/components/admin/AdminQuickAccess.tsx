"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { SquaresFour } from "@phosphor-icons/react"
import { useAdmin } from "@/lib/admin-context"

/**
 * Floating shortcut to the admin dashboard, shown on the PUBLIC site only when
 * an admin is signed in — so they never have to type the /admin URL. Hidden on
 * /admin/* (already there) and inside the content-workspace preview iframe
 * (previewEdit), where it would clutter the real-page preview.
 */
export function AdminQuickAccess() {
  const { isAuthenticated, previewEdit } = useAdmin()
  const pathname = usePathname()

  const show =
    isAuthenticated && !previewEdit && !(pathname?.startsWith("/admin") ?? false)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-[70] print:hidden"
        >
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2.5 rounded-full bg-foreground px-6 py-4 font-sans text-base font-medium text-white shadow-2xl transition-colors hover:bg-foreground/90 active:scale-[0.98]"
          >
            <SquaresFour size={24} weight="bold" />
            Tableau de bord
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
