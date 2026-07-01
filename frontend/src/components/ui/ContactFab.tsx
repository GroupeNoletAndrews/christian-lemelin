"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { PaperPlaneTilt, ArrowUpRight } from "@phosphor-icons/react"
import { useAdmin } from "@/lib/admin-context"

// Floating "Nous joindre" button, bottom-right. Collapsed = a black, icon-only
// round button (no text, can't be dismissed). Clicking it expands a black panel
// with the message + a link to /contact. Shown on internal pages only (the home
// page has the full ContactCTA section instead — see SiteChrome).
export function ContactFab() {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { isAuthenticated, previewEdit } = useAdmin()

  // Click-outside / Escape collapse the panel (the button itself stays).
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  // Hidden for a signed-in admin: on the public site the "Tableau de bord"
  // shortcut (AdminQuickAccess) already sits bottom-right — two FABs would
  // overlap — and inside the content-workspace preview iframe it would clutter
  // the real-page preview. Placed AFTER all hooks so hook order stays stable.
  if (isAuthenticated || previewEdit) return null

  return (
    <motion.div
      ref={ref}
      className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-3 md:bottom-6 md:right-6"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.6, delay: 1 }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="w-[min(18rem,calc(100vw-2.5rem))] origin-bottom-right rounded-2xl bg-foreground p-5 text-white shadow-xl shadow-black/30"
          >
            <p className="text-base font-medium leading-snug">Un projet métal en tête ?</p>
            <p className="mt-1.5 text-sm leading-snug text-white/60">
              Notre équipe technique vous répond dans les 24 heures.
            </p>
            <Link
              href="/contact"
              className="group mt-4 flex items-center justify-center gap-2 rounded-full bg-white py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/90"
            >
              Nous joindre
              <ArrowUpRight
                size={15}
                weight="bold"
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Contactez-nous"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full bg-foreground py-3 pl-5 pr-5 text-sm font-medium text-white shadow-lg shadow-black/25 transition-transform duration-200 hover:scale-[1.03] active:scale-95"
      >
        <PaperPlaneTilt size={18} weight="fill" />
        Contactez-nous
      </button>
    </motion.div>
  )
}
