// Page scroll lock for full-screen overlays (réalisation viewer, solution
// viewer). Two things it does that a bare `body{overflow:hidden}` does not:
//
//  1. **Compensates the scrollbar width.** On a platform with classic
//     scrollbars (Windows Chrome, ~15 px) hiding the overflow removes the
//     scrollbar, so `document.documentElement.clientWidth` GROWS while an
//     overlay is open and shrinks again on close. Every layout jumps sideways,
//     and — worse — any ResizeObserver refires. SolutionsTimeline measures its
//     scene that way and re-places the cards from the scroll progress on each
//     resize, which is how closing a solution viewer could leave the whole
//     timeline faded out. Padding the body by the missing width keeps the
//     layout width constant, so nothing reflows.
//
//  2. **Counts locks.** Overlays overlap: AnimatePresence keeps the outgoing
//     one mounted while the incoming one mounts, so a naive "restore on
//     unmount" releases a lock the new overlay still needs.
//
// Lenis must still be stopped separately — it drives the page's smooth scroll
// and ignores `overflow`.

let locks = 0
let restore: { overflow: string; paddingRight: string } | null = null

function applyLock() {
  const scrollbar = window.innerWidth - document.documentElement.clientWidth
  if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
  document.body.style.overflow = "hidden"
}

export function lockScroll(): void {
  if (locks++ > 0) return
  restore = {
    overflow: document.body.style.overflow,
    paddingRight: document.body.style.paddingRight,
  }
  applyLock()
}

export function unlockScroll(): void {
  locks = Math.max(0, locks - 1)
  if (locks > 0) return
  // Deliberately NOT restoring the captured value: an overlay opened from a
  // deep link (?s=…, ?featured=…) mounts while the Preloader still holds
  // `overflow:hidden`, and putting that back would leave the page unscrollable
  // for good. The Preloader clears its own lock when it finishes.
  document.body.style.overflow = ""
  document.body.style.paddingRight = restore?.paddingRight ?? ""
  restore = null
}

/** Re-assert the lock without touching the count — for the moment the
 *  Preloader finishes and clears `body{overflow}` under an open overlay. */
export function relockScroll(): void {
  if (locks > 0) applyLock()
}
