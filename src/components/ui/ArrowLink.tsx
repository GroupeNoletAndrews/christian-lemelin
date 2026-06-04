import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr"

// OPUS link: underlined neutral text + blue ↗ arrow — see DESIGN.md §7.
// Text is never blue; only the arrow carries the accent.
export function ArrowLink({
  href,
  children,
  dark = false,
  className = "",
}: {
  href: string
  children: ReactNode
  dark?: boolean
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 text-[14px] underline decoration-1 underline-offset-[5px] transition-colors ${
        dark
          ? "text-white decoration-white/40 hover:decoration-white"
          : "text-foreground decoration-foreground/30 hover:decoration-foreground"
      } ${className}`}
    >
      {children}
      <ArrowUpRight
        size={16}
        weight="bold"
        className="text-accent transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </Link>
  )
}
