"use client"

import { useEffect, useState } from "react"

// Space meter shown at the bottom of the content-workspace sidebar so the owner
// knows how much Supabase Storage is left before uploads risk busting the quota.
// Reads GET /api/admin/storage-usage (media + CV buckets, summed server-side).

type Usage = {
  totalBytes: number
  totalObjects: number
  limitBytes: number | null
}

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  const units = ["Ko", "Mo", "Go", "To"]
  let v = bytes / 1024
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`
}

export function StorageMeter() {
  const [usage, setUsage] = useState<Usage | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    fetch("/api/admin/storage-usage")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("usage"))))
      .then((d: Usage) => alive && setUsage(d))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])

  if (failed) return null

  const pct =
    usage && usage.limitBytes ? Math.min(100, (usage.totalBytes / usage.limitBytes) * 100) : null
  const warn = pct != null && pct >= 80

  return (
    <div className="shrink-0 border-t border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-muted">
          Stockage
        </p>
        <p className="font-mono text-[10px] text-foreground-muted">
          {usage ? fmt(usage.totalBytes) : "…"}
          {usage?.limitBytes ? ` / ${fmt(usage.limitBytes)}` : ""}
        </p>
      </div>
      {pct != null && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${
              warn ? "bg-red-600" : "bg-foreground"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <p className="mt-1.5 font-mono text-[10px] text-foreground-muted">
        {usage
          ? `${usage.totalObjects} fichier${usage.totalObjects > 1 ? "s" : ""}${
              warn ? " · presque plein" : ""
            }`
          : "Calcul de l'espace…"}
      </p>
    </div>
  )
}
