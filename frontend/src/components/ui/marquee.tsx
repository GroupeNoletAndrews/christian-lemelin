import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

// Marquee primitive (ui-layouts / magicui pattern), adapted to the project.
// Animation lives in globals.css (`@keyframes marquee` + `--animate-marquee`),
// driven by the `--duration` / `--gap` custom properties so each instance can
// tune speed/spacing per breakpoint. Respects `prefers-reduced-motion`
// (globals.css disables the animation). — see DESIGN.md §5.
interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /** Reverse the scroll direction. */
  reverse?: boolean
  /** Pause the animation while hovered. */
  pauseOnHover?: boolean
  /** Scroll vertically instead of horizontally. */
  vertical?: boolean
  /** How many times the children are repeated to fill the track seamlessly. */
  repeat?: number
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        { "flex-row": !vertical, "flex-col": vertical },
        className,
      )}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
            "animate-marquee flex-row": !vertical,
            "animate-marquee-vertical flex-col": vertical,
            "group-hover:[animation-play-state:paused]": pauseOnHover,
            "[animation-direction:reverse]": reverse,
          })}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
