"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

interface ConfirmDialogProps {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  /** "danger" = red confirm button (irreversible/destructive actions). */
  tone?: "default" | "danger"
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * In-design confirmation dialog (replaces window.confirm). Matches the site
 * overlay pattern from ApplyModal: blurred backdrop + token-styled panel,
 * Esc / backdrop to cancel.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  tone = "default",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, busy, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
            onClick={busy ? undefined : onCancel}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-7"
          >
            <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            {message && (
              <p className="mt-2 font-sans text-sm leading-relaxed text-foreground-muted">
                {message}
              </p>
            )}
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="rounded-full border border-border px-5 py-2.5 font-sans text-sm text-foreground transition-colors hover:bg-surface-elevated disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={busy}
                className={`rounded-full px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors active:scale-[0.99] disabled:opacity-50 ${
                  tone === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-accent hover:bg-accent-hover"
                }`}
              >
                {busy ? "…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
