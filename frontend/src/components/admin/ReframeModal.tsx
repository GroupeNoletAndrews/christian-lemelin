"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "@phosphor-icons/react"
import {
  cleanSlotStyle,
  slotBoxCss,
  slotImgCss,
  type SlotCaps,
  type SlotStyle,
} from "@/lib/section-style"

// Non-destructive reframe + style editor for one image slot. Drag inside the
// frame to set the focal point (object-position), slide to zoom; optional
// grayscale / rounded / border when the section allows it (caps). Applies a
// SlotStyle (or null to reset) — nothing is uploaded; the box size never changes.

const RADII = [
  { label: "Aucun", value: "" },
  { label: "Doux", value: "12px" },
  { label: "Marqué", value: "24px" },
  { label: "Rond", value: "9999px" },
]
const BORDER = "1px solid rgba(20,20,20,0.18)"

function parsePos(pos?: string | null): [number, number] {
  const [x, y] = (pos ?? "50% 50%").split(/\s+/).map((s) => parseFloat(s))
  return [Number.isFinite(x) ? x : 50, Number.isFinite(y) ? y : 50]
}

export function ReframeModal({
  open,
  src,
  aspect,
  caps,
  grayscaleDefault,
  initial,
  onClose,
  onApply,
}: {
  open: boolean
  src: string
  aspect: string
  caps: SlotCaps
  grayscaleDefault: boolean
  initial: SlotStyle | null
  onClose: () => void
  onApply: (style: SlotStyle | null) => void
}) {
  const [posX, setPosX] = useState(50)
  const [posY, setPosY] = useState(50)
  const [zoom, setZoom] = useState(1)
  const [gray, setGray] = useState<boolean | null>(null)
  const [radius, setRadius] = useState("")
  const [border, setBorder] = useState(false)
  // Preview-only crop ratio to help centring — the same focal point can be
  // checked against several ratios (the slot's real ratio + common ones).
  const [previewRatio, setPreviewRatio] = useState(aspect)
  const frameRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  // The slot's own ratio first, then common presets (deduped).
  const ratios = Array.from(new Set([aspect, "1/1", "4/3", "3/4", "16/9"]))

  // Seed the controls from the current style whenever the modal opens.
  useEffect(() => {
    if (!open) return
    const [ix, iy] = parsePos(initial?.objectPosition)
    setPosX(ix)
    setPosY(iy)
    setZoom(initial?.zoom ?? 1)
    setGray(initial?.grayscale ?? null)
    setRadius(initial?.borderRadius ?? "")
    setBorder(!!initial?.border)
    setPreviewRatio(aspect)
  }, [open, initial, aspect])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (open && typeof document === "undefined") return null
  if (!open) return null

  const style: SlotStyle = {
    objectPosition: `${Math.round(posX)}% ${Math.round(posY)}%`,
    zoom,
    grayscale: caps.filter ? gray : undefined,
    borderRadius: caps.style && radius ? radius : undefined,
    border: caps.style && border ? BORDER : undefined,
  }
  const effGray = (caps.filter ? gray : null) ?? grayscaleDefault

  const move = (e: React.PointerEvent) => {
    const r = frameRef.current?.getBoundingClientRect()
    if (!r) return
    setPosX(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))
    setPosY(Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)))
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Recadrer l'image"
    >
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Recadrer l&apos;image
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid size-8 place-items-center rounded-full text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Ratio chips — check the framing against several ratios (preview only). */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
            Aperçu ratio
          </span>
          {ratios.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setPreviewRatio(r)}
              className={`rounded-full px-2.5 py-1 font-sans text-xs transition-colors ${
                previewRatio === r
                  ? "bg-foreground text-white"
                  : "border border-border text-foreground hover:bg-surface-elevated"
              }`}
            >
              {r}
              {r === aspect ? " ·" : ""}
            </button>
          ))}
        </div>

        {/* Live frame — drag to set the focal point. Rule-of-thirds grid helps centring. */}
        <div
          ref={frameRef}
          onPointerDown={(e) => {
            dragging.current = true
            e.currentTarget.setPointerCapture(e.pointerId)
            move(e)
          }}
          onPointerMove={(e) => dragging.current && move(e)}
          onPointerUp={() => (dragging.current = false)}
          className="relative mx-auto w-full max-h-[50vh] cursor-grab touch-none select-none overflow-hidden bg-surface-elevated active:cursor-grabbing"
          style={{ aspectRatio: previewRatio.replace("/", " / "), ...slotBoxCss(style) }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            draggable={false}
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover${effGray ? " grayscale" : ""}`}
            style={slotImgCss(style)}
          />
          {/* Rule-of-thirds grid overlay. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-y-0 left-1/3 w-px bg-white/40" />
            <div className="absolute inset-y-0 left-2/3 w-px bg-white/40" />
            <div className="absolute inset-x-0 top-1/3 h-px bg-white/40" />
            <div className="absolute inset-x-0 top-2/3 h-px bg-white/40" />
            {/* Centre marker at the current focal point. */}
            <div
              className="absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90 mix-blend-difference"
              style={{ left: `${posX}%`, top: `${posY}%` }}
            />
          </div>
          <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-foreground/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white">
            Glissez pour recadrer
          </span>
        </div>

        {/* Controls */}
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-foreground-muted">
              <span>Zoom</span>
              <span>{zoom.toFixed(2)}×</span>
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-foreground"
            />
          </label>

          {caps.filter && (
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground-muted">
                Noir &amp; blanc
              </span>
              <div className="flex gap-1">
                {(
                  [
                    ["Défaut", null],
                    ["Oui", true],
                    ["Non", false],
                  ] as const
                ).map(([lbl, val]) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setGray(val)}
                    className={`rounded-full px-3 py-1 font-sans text-xs transition-colors ${
                      gray === val
                        ? "bg-foreground text-white"
                        : "border border-border text-foreground hover:bg-surface-elevated"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {caps.style && (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground-muted">
                  Coins
                </span>
                <div className="flex gap-1">
                  {RADII.map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => setRadius(r.value)}
                      className={`rounded-full px-3 py-1 font-sans text-xs transition-colors ${
                        radius === r.value
                          ? "bg-foreground text-white"
                          : "border border-border text-foreground hover:bg-surface-elevated"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground-muted">
                  Bordure
                </span>
                <button
                  type="button"
                  onClick={() => setBorder((b) => !b)}
                  className={`rounded-full px-3 py-1 font-sans text-xs transition-colors ${
                    border
                      ? "bg-foreground text-white"
                      : "border border-border text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  {border ? "Activée" : "Aucune"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onApply(null)}
            className="font-sans text-sm text-foreground-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Réinitialiser
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-surface-elevated"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => onApply(cleanSlotStyle(style))}
              className="rounded-full bg-accent px-5 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.99]"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
