"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react"

export type ToastTone = "success" | "error"
export interface ToastState {
  message: string
  tone: ToastTone
}

/**
 * Lightweight transient notification (replaces window.alert). Controlled:
 * pass a ToastState to show, null to hide; auto-dismisses after `duration`.
 */
export function Toast({
  toast,
  onClose,
  duration = 3500,
}: {
  toast: ToastState | null
  onClose: () => void
  duration?: number
}) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [toast, duration, onClose])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-5 left-1/2 z-[130] flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2.5"
        >
          {toast.tone === "success" ? (
            <CheckCircle size={18} weight="fill" className="text-accent" />
          ) : (
            <WarningCircle size={18} weight="fill" className="text-red-600" />
          )}
          <span className="font-sans text-sm text-foreground">{toast.message}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="ml-1 rounded p-0.5 text-foreground-muted transition-colors hover:text-foreground"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
