"use client"

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react"
import { ConfirmDialog } from "./ConfirmDialog"
import { Toast, type ToastState, type ToastTone } from "./Toast"

interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: "default" | "danger"
}

interface FeedbackContextValue {
  /** Promise-based replacement for window.confirm: `if (await confirm({...}))`. */
  confirm: (options: ConfirmOptions) => Promise<boolean>
  /** Transient notification replacement for window.alert. */
  toast: (message: string, tone?: ToastTone) => void
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

/**
 * App-wide confirm dialog + toast, so any admin screen gets on-brand popups
 * (no native window.confirm/alert) without re-wiring its own modal state.
 * Mounted once in the admin layout.
 */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<{
    options: ConfirmOptions
    resolve: (v: boolean) => void
  } | null>(null)
  const [toastState, setToastState] = useState<ToastState | null>(null)

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        // Single dialog slot: if one is already open, settle it as cancelled so
        // its awaiting caller isn't left with a promise that never resolves.
        setDialog((prev) => {
          prev?.resolve(false)
          return { options, resolve }
        })
      }),
    [],
  )

  const toast = useCallback((message: string, tone: ToastTone = "success") => {
    setToastState({ message, tone })
  }, [])

  const settle = (value: boolean) => {
    dialog?.resolve(value)
    setDialog(null)
  }

  return (
    <FeedbackContext.Provider value={{ confirm, toast }}>
      {children}
      <ConfirmDialog
        open={!!dialog}
        title={dialog?.options.title ?? ""}
        message={dialog?.options.message}
        confirmLabel={dialog?.options.confirmLabel}
        cancelLabel={dialog?.options.cancelLabel}
        tone={dialog?.options.tone}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
      <Toast toast={toastState} onClose={() => setToastState(null)} />
    </FeedbackContext.Provider>
  )
}

function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error("useFeedback must be used within FeedbackProvider")
  return ctx
}

export const useConfirm = () => useFeedback().confirm
export const useToast = () => useFeedback().toast
