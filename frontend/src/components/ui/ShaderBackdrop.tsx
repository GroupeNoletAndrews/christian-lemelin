"use client"

import { Component, type ReactNode } from "react"
import dynamic from "next/dynamic"

/* eslint-disable @typescript-eslint/no-explicit-any */
// @shadergradient/react ships its own (older) R3F runtime and is WebGL-heavy,
// so we load it lazily, client-only, and only where it's mounted (the material
// modal backdrop). Props are loosely typed because the dynamic wrapper erases
// the component's prop types.
const ShaderGradientCanvas = dynamic(
  () => import("@shadergradient/react").then((m) => m.ShaderGradientCanvas as any),
  { ssr: false },
) as any
const ShaderGradient = dynamic(
  () => import("@shadergradient/react").then((m) => m.ShaderGradient as any),
  { ssr: false },
) as any
/* eslint-enable @typescript-eslint/no-explicit-any */

// If the WebGL runtime fails to load/init (old fiber under React 19, no GPU,
// etc.) we fall back to a static monochrome CSS gradient — the modal stays
// usable.
class ShaderBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

// Animated monochrome (black / grey / white) gradient — used behind the
// material modal. Tones only, per the design constraint. See DESIGN.md.
export function ShaderBackdrop({ className = "" }: { className?: string }) {
  const fallback = (
    <div
      className={className}
      style={{
        background:
          "radial-gradient(125% 125% at 30% 15%, #6b6b6b 0%, #2a2a2a 45%, #0a0a0a 100%)",
      }}
    />
  )

  return (
    <ShaderBoundary fallback={fallback}>
      <div className={className}>
        <ShaderGradientCanvas style={{ width: "100%", height: "100%" }} pixelDensity={1}>
          <ShaderGradient
            control="props"
            type="waterPlane"
            color1="#0a0a0a"
            color2="#3d3d3d"
            color3="#8a8a8a"
            animate="on"
            uSpeed={0.16}
            uStrength={1.5}
            grain="off"
            brightness={1.1}
            cAzimuthAngle={180}
            cPolarAngle={80}
            cDistance={3.2}
          />
        </ShaderGradientCanvas>
      </div>
    </ShaderBoundary>
  )
}
