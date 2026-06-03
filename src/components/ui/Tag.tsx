import type { ReactNode } from "react"

// OPUS outline tag pill — see DESIGN.md §7.
export function Tag({
  children,
  dark = false,
}: {
  children: ReactNode
  dark?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] tracking-wide ${
        dark ? "border-white/15 text-white/60" : "border-border text-foreground-muted"
      }`}
    >
      {children}
    </span>
  )
}
