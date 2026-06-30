"use client"

import { useCallback, useEffect, useRef } from "react"
import { useConfirm } from "@/components/admin/FeedbackProvider"

interface UnsavedChangesOptions {
  /** Where to go when the user confirms leaving via the browser Back button.
   *  Defaults to `history.back()`, but pass an explicit push (e.g. to the
   *  dashboard) so leaving is deterministic even if this page is the first
   *  history entry (bookmark / deep link / fresh tab). */
  onConfirmExit?: () => void
}

/**
 * Guards against losing unpublished edits when leaving an editor.
 *
 * While `dirty` is true it covers every way out of the page:
 *  - In-app navigation (`<Link>` / section switches) → call `confirmLeave()`
 *    first; it shows the on-brand {@link ConfirmDialog} and resolves the choice.
 *  - Tab close / reload / external URL → native `beforeunload` prompt (browsers
 *    forbid a custom dialog here, so this one is unavoidably the browser's own).
 *  - Browser Back button → `popstate` is intercepted with a sentinel history
 *    entry that is re-pinned on every Back press, then routed through the same
 *    `confirmLeave()` dialog.
 *
 * Returns `confirmLeave()`: resolves `true` (ok to leave) immediately when not
 * dirty, otherwise resolves the user's dialog choice. Re-entrant calls while a
 * dialog is already open resolve `false` rather than stacking a second dialog.
 *
 * When the user confirms leaving, navigate with `router.replace` (see
 * `onConfirmExit`) so the same-URL sentinel sitting on top of the stack is
 * consumed rather than orphaned.
 */
export function useUnsavedChanges(
  dirty: boolean,
  { onConfirmExit }: UnsavedChangesOptions = {},
) {
  const confirm = useConfirm()

  // Latest values read from listeners without re-subscribing them. Synced in an
  // effect (not during render) so the long-lived popstate listener and
  // confirmLeave always see current values.
  const dirtyRef = useRef(dirty)
  const onConfirmExitRef = useRef(onConfirmExit)
  useEffect(() => {
    dirtyRef.current = dirty
    onConfirmExitRef.current = onConfirmExit
  })

  const pendingRef = useRef(false) // a confirm dialog is currently open
  const sentinelRef = useRef(false) // our same-URL history sentinel is on the stack
  const ignorePopRef = useRef(false) // skip the next popstate (we triggered it)

  const confirmLeave = useCallback(async () => {
    if (!dirtyRef.current) return true
    if (pendingRef.current) return false // already asking — don't stack dialogs
    pendingRef.current = true
    try {
      return await confirm({
        title: "Modifications non publiées",
        message:
          "Vous avez des modifications qui ne sont pas encore publiées. Si vous quittez maintenant, elles seront perdues.",
        confirmLabel: "Quitter sans publier",
        cancelLabel: "Rester sur la page",
        tone: "danger",
      })
    } finally {
      pendingRef.current = false
    }
  }, [confirm])

  // Tab close / reload / external navigation: only the native prompt can block
  // these, so we arm it while dirty (its text is fixed by the browser).
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "" // legacy browsers require a truthy returnValue
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirty])

  // Maintain a single same-URL sentinel history entry while dirty so the browser
  // Back button has something to pop into. Retract it when the edits are cleared
  // *while staying on the page* (publish / discard / section switch) so a later
  // Back isn't silently swallowed.
  useEffect(() => {
    if (dirty && !sentinelRef.current) {
      sentinelRef.current = true
      window.history.pushState(null, "", window.location.href)
    } else if (!dirty && sentinelRef.current) {
      sentinelRef.current = false
      ignorePopRef.current = true
      window.history.back() // pop our (top, same-URL) sentinel — no visible nav
    }
  }, [dirty])

  // Browser Back button: beforeunload never fires for a SPA history pop, so we
  // intercept popstate. The pop has already happened (it isn't cancelable), so
  // we immediately re-pin the sentinel — this keeps the URL on this page and
  // means repeated/rapid Back presses can never escape while we ask.
  useEffect(() => {
    const onPopState = () => {
      if (ignorePopRef.current) {
        ignorePopRef.current = false
        return
      }
      if (!dirtyRef.current) {
        sentinelRef.current = false
        return // clean: let the navigation stand
      }
      window.history.pushState(null, "", window.location.href) // re-pin now
      sentinelRef.current = true
      if (pendingRef.current) return // dialog already open — just re-pinned
      void confirmLeave().then((ok) => {
        if (!ok) return // stay: sentinel is already back in place
        sentinelRef.current = false
        window.removeEventListener("popstate", onPopState)
        if (onConfirmExitRef.current) onConfirmExitRef.current()
        else window.history.back()
      })
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [confirmLeave])

  return { confirmLeave }
}
