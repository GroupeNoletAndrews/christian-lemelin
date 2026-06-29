"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight, ArrowsClockwise, Star } from "@phosphor-icons/react"
import { mediaUrl } from "@/lib/media"

export interface ManagedImage {
  /** Display URL — a live storage key/URL, or a staged data: URL (not yet uploaded). */
  url: string
  /** True when this slot holds a staged (un-published) replacement. */
  staged?: boolean
}

interface SectionImageManagerProps {
  images: ManagedImage[]
  /** Stage a replacement for an image — the file is NOT uploaded until publish. */
  onReplace: (index: number, file: File) => void
  /** Reorder images within the set (omit to disable reordering, e.g. single-slot). */
  onMove?: (index: number, dir: -1 | 1) => void
  /** Whether the first image is the cover (réalisations) — shows a badge. */
  cover?: boolean
}

/**
 * Swap + (optionally) reorder a set of images. Nothing is uploaded here — a
 * replacement is staged in the parent and only sent to storage on publish, so
 * cancelling leaves zero trace. Controls sit below each image, always visible.
 */
export function SectionImageManager({
  images,
  onReplace,
  onMove,
  cover = true,
}: SectionImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null)

  const pickReplacement = (index: number) => {
    setReplaceIndex(index)
    inputRef.current?.click()
  }

  const handleFile = (fileList: FileList | null) => {
    const file = fileList?.[0]
    const index = replaceIndex
    if (inputRef.current) inputRef.current.value = ""
    setReplaceIndex(null)
    if (!file || index === null) return
    onReplace(index, file)
  }

  if (images.length === 0) {
    return <p className="font-sans text-sm text-foreground-muted">Aucune image.</p>
  }

  const multiple = images.length > 1 && !!onMove

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3">
        {images.map((img, i) => (
          <li
            key={`${i}-${img.url.slice(-24)}`}
            className="overflow-hidden rounded-xl border border-border bg-surface"
          >
            <div className="relative aspect-[4/3] bg-surface-elevated">
              <Image
                src={mediaUrl(img.url)}
                alt={`Image ${i + 1}`}
                fill
                unoptimized
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
              {cover && i === 0 && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-white">
                  <Star size={10} weight="fill" />
                  Couverture
                </span>
              )}
              {img.staged && (
                <span className="absolute right-2 top-2 inline-flex items-center rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-white">
                  Modifié
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-1 px-2 py-2">
              {multiple ? (
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => onMove?.(i, -1)}
                    disabled={i === 0}
                    aria-label="Déplacer avant"
                    className="rounded-md p-1.5 text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove?.(i, 1)}
                    disabled={i === images.length - 1}
                    aria-label="Déplacer après"
                    className="rounded-md p-1.5 text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={() => pickReplacement(i)}
                aria-label="Remplacer cette image"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-sans text-xs font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-surface-elevated"
              >
                <ArrowsClockwise size={14} />
                Remplacer
              </button>
            </div>
          </li>
        ))}
      </ul>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files)}
        className="hidden"
      />

      <p className="mt-2 font-sans text-xs text-foreground-muted">
        {cover ? "La première image sert de couverture. " : ""}« Remplacer »
        change une photo{multiple ? " ; les flèches la réordonnent." : "."} Rien
        n&apos;est enregistré avant « Publier ».
      </p>
    </div>
  )
}
