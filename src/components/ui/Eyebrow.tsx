import type { ReactNode } from "react"

// OPUS eyebrow pill — see DESIGN.md §7. Rounded pill, blue dot + uppercase mono label.
export function Eyebrow({
  children,
  dark = false,
  className = "",
}: {
  children: ReactNode
  dark?: boolean
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] ${
        dark
          ? "border-white/15 bg-white/5 text-white/70"
          : "border-border bg-surface text-foreground-muted"
      } ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </span>
  )
}
