"use client"

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "motion/react"
import { X } from "@phosphor-icons/react"
import { useLenis } from "@/components/providers/LenisProvider"
import { cn } from "@/lib/utils"

// "Linear modal" — a morphing dialog (ui-layouts / motion-primitives pattern)
// adapted to the project: a trigger card expands (shared `layoutId`) into a
// portaled panel. Escape / click-outside / scroll-lock built in; respects
// prefers-reduced-motion (falls back to a plain fade, no morph). See DESIGN.md.

interface DialogContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  uniqueId: string
  morph: boolean
}

const DialogContext = createContext<DialogContextValue | null>(null)

function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error("Dialog parts must be used inside <Dialog>")
  return ctx
}

export function Dialog({
  children,
  transition,
  morph: morphProp = true,
}: {
  children: ReactNode
  transition?: Transition
  // When false, the dialog fades/scales in instead of morphing from the
  // trigger (no shared-element resize). Reduced-motion always disables morph.
  morph?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const uniqueId = useId()
  const reduce = useReducedMotion()

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({ isOpen, open, close, uniqueId, morph: morphProp && !reduce }),
    [isOpen, open, close, uniqueId, reduce, morphProp],
  )

  return (
    <DialogContext.Provider value={value}>
      <MotionConfig
        transition={transition ?? { type: "spring", bounce: 0.05, duration: 0.5 }}
      >
        {children}
      </MotionConfig>
    </DialogContext.Provider>
  )
}

export function DialogTrigger({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  const { open, uniqueId, isOpen, morph } = useDialog()
  return (
    <motion.div
      layoutId={morph ? `dialog-${uniqueId}` : undefined}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          open()
        }
      }}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      className={cn("cursor-pointer text-left", className)}
      style={style}
    >
      {children}
    </motion.div>
  )
}

export function DialogContainer({
  children,
  className,
  dim = true,
}: {
  children: ReactNode
  className?: string
  // Built-in dark dim layer. Disable it when the content supplies its own
  // backdrop (e.g. the material modal's animated shader at ~90% opacity).
  dim?: boolean
}) {
  const { isOpen, close, uniqueId } = useDialog()
  const lenis = useLenis()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    lenis?.stop()
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      lenis?.start()
      document.body.style.overflow = prev
    }
  }, [isOpen, close, lenis])

  // Portal target only exists in the browser. When closed the portal renders
  // nothing, so SSR (null) and the client agree — no hydration mismatch.
  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key={`dialog-portal-${uniqueId}`}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Dim layer (purely visual; click-to-close is on the wrapper). */}
          {dim && (
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/92 backdrop-blur-md" />
          )}
          {/* Click-outside closes; the panel stops propagation. */}
          <div
            className={cn("relative flex h-full w-full items-center justify-center", className)}
            onClick={(e) => {
              if (e.target === e.currentTarget) close()
            }}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function DialogContent({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  const { uniqueId, morph } = useDialog()
  const ref = useRef<HTMLDivElement>(null)

  // Move focus into the panel on open, restore it to the previously focused
  // element on close.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    return () => prev?.focus?.()
  }, [])

  return (
    <motion.div
      ref={ref}
      layoutId={morph ? `dialog-${uniqueId}` : undefined}
      initial={morph ? undefined : { opacity: 0, scale: 0.96 }}
      animate={morph ? undefined : { opacity: 1, scale: 1 }}
      exit={morph ? undefined : { opacity: 0, scale: 0.96 }}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onClick={(e) => e.stopPropagation()}
      // Lenis is stopped while the modal is open, but it still swallows touch
      // events — without this the inner overflow-y-auto area won't scroll on
      // mobile. data-lenis-prevent makes Lenis ignore this subtree.
      data-lenis-prevent
      className={cn("relative z-10 overflow-hidden outline-none", className)}
      style={style}
    >
      {children}
    </motion.div>
  )
}

export function DialogImage({
  src,
  alt,
  className,
  style,
}: {
  src: string
  alt: string
  className?: string
  style?: CSSProperties
}) {
  const { uniqueId, morph } = useDialog()
  return (
    // Shared-element morph needs the same DOM node identity, so we use
    // motion.img rather than next/image (whose wrapper breaks layoutId).
    <motion.img
      src={src}
      alt={alt}
      layoutId={morph ? `dialog-img-${uniqueId}` : undefined}
      className={className}
      style={style}
    />
  )
}

export function DialogTitle({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { uniqueId, morph } = useDialog()
  return (
    <motion.div layoutId={morph ? `dialog-title-${uniqueId}` : undefined} className={className}>
      {children}
    </motion.div>
  )
}

export function DialogDescription({
  children,
  className,
  variants,
  disableLayoutAnimation,
}: {
  children: ReactNode
  className?: string
  variants?: Variants
  disableLayoutAnimation?: boolean
}) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout={disableLayoutAnimation ? undefined : "position"}
    >
      {children}
    </motion.div>
  )
}

export function DialogClose({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) {
  const { close } = useDialog()
  return (
    <button
      type="button"
      onClick={close}
      aria-label="Fermer"
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors",
        className,
      )}
    >
      {children ?? <X size={20} weight="bold" />}
    </button>
  )
}
