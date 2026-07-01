"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ArrowLeft,
  ArrowsClockwise,
  CaretDown,
  CheckCircle,
  CircleNotch,
  DotsSixVertical,
  ImageSquare,
  PencilSimple,
} from "@phosphor-icons/react"
import { useAdmin } from "@/lib/admin-context"
import { api, type SectionAdminState } from "@/lib/api"
import { imgSrc } from "@/lib/media"
import { sectionSlotKey } from "@/lib/sections-registry"
import { fileToCompressedBlob } from "@/lib/image-utils"
import { uploadImageToKey } from "@/lib/uploads"
import {
  SectionImageManager,
  type ManagedImage,
} from "@/components/admin/SectionImageManager"
import { useConfirm, useToast } from "@/components/admin/FeedbackProvider"
import { useUnsavedChanges } from "@/components/admin/use-unsaved-changes"

// Editable content grouped BY PAGE, then by section — so the menu mirrors the
// real site. `anchor` is the DOM id of the section on its page: the preview
// scrolls there so the admin lands ON the section (e.g. Savoir-faire sits far
// down the home page, not at the top). `enabled` = wired into the editor.
// Réalisations uses the DB-backed staged editor; the others are static-section
// slot editors.
type SectionEntry = {
  id: string
  label: string
  enabled: boolean
  /** DOM id of the section on its page; the preview scrolls here on load. */
  anchor?: string
}
type PageGroup = { page: string; sections: SectionEntry[] }

const PAGES: PageGroup[] = [
  {
    page: "Accueil",
    sections: [
      { id: "savoir-faire", label: "Savoir-faire", enabled: true, anchor: "savoir-faire" },
    ],
  },
  {
    page: "Réalisations",
    sections: [{ id: "realisations", label: "Réalisations", enabled: true }],
  },
  {
    page: "À propos",
    sections: [{ id: "a-propos", label: "À propos", enabled: true, anchor: "a-propos" }],
  },
  {
    page: "Installations",
    sections: [
      { id: "installations", label: "Installations", enabled: true, anchor: "installations" },
    ],
  },
  {
    page: "Fabrication",
    sections: [{ id: "materiaux", label: "Matériaux", enabled: true, anchor: "materiaux" }],
  },
  {
    page: "Solutions",
    sections: [{ id: "solutions", label: "Solutions", enabled: true, anchor: "solutions" }],
  },
]

// Flat lookup of a section's metadata by id (active state is a section id).
const SECTION_BY_ID: Record<string, SectionEntry> = Object.fromEntries(
  PAGES.flatMap((p) => p.sections.map((s) => [s.id, s])),
)

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })
}

const version = (iso: string) => new Date(iso).getTime()

export default function ContentWorkspacePage() {
  const router = useRouter()
  const toast = useToast()
  const { isAuthenticated, authLoading } = useAdmin()
  const [active, setActive] = useState<string>("realisations")
  // Dirty state is lifted from the active editor so the left-rail exits (back
  // link, section switch) and the browser guards can all react to it.
  const [dirty, setDirty] = useState(false)
  const { confirmLeave } = useUnsavedChanges(dirty, {
    // `replace` (not `push`) consumes the same-URL Back-button sentinel that's
    // on top of the stack, so leaving doesn't orphan a phantom history entry.
    onConfirmExit: () => router.replace("/admin/dashboard"),
  })

  // Auth loss (token expiry / sign-out in another tab). With nothing staged,
  // redirect to login as before. But if there are unpublished edits, bouncing
  // would discard them silently — so instead keep the editor mounted (edits
  // preserved) and inform once; the user can re-connect in another tab to
  // publish, or leave via a guarded exit (back link / Back / tab close). The
  // admin layout excludes this route from its blanket redirect so this owns it.
  const notifiedAuthLossRef = useRef(false)
  useEffect(() => {
    if (authLoading) return
    if (isAuthenticated) {
      notifiedAuthLossRef.current = false // re-arm for a future session loss
      return
    }
    if (!dirty) {
      router.replace("/admin")
      return
    }
    if (!notifiedAuthLossRef.current) {
      notifiedAuthLossRef.current = true
      toast(
        "Session expirée. Reconnectez-vous (dans un autre onglet) pour publier vos modifications non enregistrées.",
        "error",
      )
    }
  }, [authLoading, isAuthenticated, dirty, router, toast])

  // While authenticating, or once signed out with nothing to lose, render
  // nothing (the effect above redirects). If signed out mid-edit, keep the
  // editor mounted so the staged edits are preserved (and the navigation guards
  // still apply) until the user re-connects or leaves deliberately.
  if (authLoading || (!isAuthenticated && !dirty)) return null

  // Switch sections, warning first if the current one has unpublished edits
  // (switching unmounts its editor and discards them).
  const handleSelect = async (id: string) => {
    if (id === active) return
    if (dirty && !(await confirmLeave())) return
    setDirty(false)
    setActive(id)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left rail: back + section menu */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface">
        <div className="border-b border-border px-4 py-4">
          <Link
            href="/admin/dashboard"
            onNavigate={(e) => {
              if (!dirty) return
              // Hold the SPA navigation, ask, then leave only if confirmed. We
              // do NOT clear `dirty` here (the page unmounts; clearing it would
              // race the sentinel-retract effect mid-nav), and use `replace` to
              // consume the Back-button sentinel rather than orphan it.
              e.preventDefault()
              void confirmLeave().then((ok) => {
                if (ok) router.replace("/admin/dashboard")
              })
            }}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft size={13} />
            Tableau de bord
          </Link>
          <h1 className="mt-2 font-display text-base font-semibold tracking-tight text-foreground">
            Contenu du site
          </h1>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto p-3">
          {PAGES.map((group) => (
            <div key={group.page}>
              <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-muted">
                {group.page}
              </p>
              <ul className="space-y-1">
                {group.sections.map((s) => (
                  <li key={s.id}>
                    <button
                      disabled={!s.enabled}
                      onClick={() => {
                        if (s.enabled) void handleSelect(s.id)
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-sans text-sm transition-colors ${
                        active === s.id
                          ? "bg-foreground text-white"
                          : s.enabled
                            ? "text-foreground hover:bg-surface-elevated"
                            : "cursor-not-allowed text-foreground-muted/50"
                      }`}
                    >
                      {s.label}
                      {!s.enabled && (
                        <span className="font-mono text-[9px] uppercase tracking-[0.1em]">
                          bientôt
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {active === "realisations" ? (
        <RealisationsEditor onDirtyChange={setDirty} />
      ) : (
        <StaticSectionEditor
          key={active}
          section={active}
          anchor={SECTION_BY_ID[active]?.anchor}
          onDirtyChange={setDirty}
        />
      )}
    </div>
  )
}

/* ---------- shared bits ---------- */

function StatusPill({ dirty }: { dirty: boolean }) {
  return dirty ? (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      Modifications non publiées
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted">
      <CheckCircle size={14} />À jour
    </span>
  )
}

function ActionBar({
  title,
  dirty,
  publishing,
  discarding,
  onPublish,
  onDiscard,
}: {
  title: string
  dirty: boolean
  publishing: boolean
  discarding: boolean
  onPublish: () => void
  onDiscard: () => void
}) {
  const busy = publishing || discarding
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-4">
      <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="flex items-center gap-3">
        <StatusPill dirty={dirty} />
        <button
          onClick={onDiscard}
          disabled={!dirty || busy}
          className="rounded-full border border-border px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-40"
        >
          {discarding ? "Annulation…" : "Annuler"}
        </button>
        <button
          onClick={onPublish}
          disabled={!dirty || busy}
          className="rounded-full bg-accent px-5 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {publishing ? "Publication…" : "Publier"}
        </button>
      </div>
    </header>
  )
}

function PreviewFrame({
  src,
  iframeRef,
  onLoad,
}: {
  src: string
  iframeRef: React.RefObject<HTMLIFrameElement | null>
  onLoad?: () => void
}) {
  return (
    <section className="relative min-w-0 flex-1 bg-surface-elevated">
      <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-foreground/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white">
        Aperçu — page réelle
      </div>
      <iframe
        ref={iframeRef}
        src={src}
        title="Aperçu"
        onLoad={onLoad}
        className="h-full w-full border-0"
      />
    </section>
  )
}

/* ---------- Réalisations editor (DB-backed, staged) ---------- */

type ImgSlot = { key: string; file?: File; dataUrl?: string }
type WorkItem = {
  id: string
  name: string
  pinned: boolean
  createdAt: string
  updatedAt: string
  slots: ImgSlot[]
}

function RealisationsEditor({
  onDirtyChange,
}: {
  onDirtyChange: (dirty: boolean) => void
}) {
  const { refreshRealisations } = useAdmin()
  const confirm = useConfirm()
  const toast = useToast()

  const [items, setItems] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [discarding, setDiscarding] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [original, setOriginal] = useState<{
    order: string[]
    images: Record<string, string[]>
  }>({ order: [], images: {} })

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({})

  const load = useCallback(async () => {
    try {
      const rows = await api.realisations.list()
      setItems(
        rows.map((r) => ({
          id: r.id,
          name: r.name,
          pinned: r.pinned,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          slots: (Array.isArray(r.images) ? r.images : []).map((key) => ({ key })),
        })),
      )
      setOriginal({
        order: rows.map((r) => r.id),
        images: Object.fromEntries(rows.map((r) => [r.id, r.images])),
      })
    } catch (e) {
      console.warn("Chargement des réalisations impossible:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      await load()
    })()
  }, [load])

  const pushPreview = useCallback((list: WorkItem[]) => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        source: "cl-content-admin",
        type: "preview-realisations",
        data: list.map((it) => ({
          id: it.id,
          name: it.name,
          pinned: it.pinned,
          createdAt: it.createdAt,
          updatedAt: it.updatedAt,
          images: it.slots.map((s) => s.dataUrl ?? s.key),
        })),
      },
      window.location.origin,
    )
  }, [])

  useEffect(() => {
    if (!loading) pushPreview(items)
  }, [items, loading, pushPreview])

  const dirty = useMemo(() => {
    if (items.map((i) => i.id).join(",") !== original.order.join(",")) return true
    for (const it of items) {
      if (it.slots.some((s) => s.file)) return true
      if (it.slots.map((s) => s.key).join(",") !== (original.images[it.id] ?? []).join(","))
        return true
    }
    return false
  }, [items, original])

  // Report dirtiness up so the page can guard navigation away from the editor;
  // reset on unmount so a switched-away editor never leaves the page stuck dirty.
  useEffect(() => {
    onDirtyChange(dirty)
    return () => onDirtyChange(false)
  }, [dirty, onDirtyChange])

  const handleReplace = async (itemId: string, index: number, file: File) => {
    let dataUrl: string
    try {
      dataUrl = await readAsDataUrl(await fileToCompressedBlob(file))
    } catch {
      toast("Image invalide. Veuillez réessayer.", "error")
      return
    }
    setItems((prev) =>
      prev.map((it) =>
        it.id !== itemId
          ? it
          : {
              ...it,
              slots: it.slots.map((s, i) => (i === index ? { ...s, file, dataUrl } : s)),
            },
      ),
    )
  }

  const handleMove = (itemId: string, index: number, dir: -1 | 1) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it
        const to = index + dir
        if (to < 0 || to >= it.slots.length) return it
        const slots = [...it.slots]
        const [moved] = slots.splice(index, 1)
        slots.splice(to, 0, moved)
        return { ...it, slots }
      }),
    )
  }

  const handlePublish = async () => {
    if (!dirty) return
    setPublishing(true)
    try {
      const o = original
      for (const it of items) {
        const hasStaged = it.slots.some((s) => s.file)
        const keys = it.slots.map((s) => s.key)
        const keysChanged = keys.join(",") !== (o.images[it.id] ?? []).join(",")
        if (!hasStaged && !keysChanged) continue
        for (const s of it.slots) {
          if (s.file) await uploadImageToKey(s.file, s.key) // overwrite same key
        }
        await api.realisations.update(it.id, {
          name: it.name,
          images: keys,
          pinned: it.pinned,
        })
      }
      if (items.map((i) => i.id).join(",") !== o.order.join(",")) {
        await api.realisations.reorder(items.map((i) => i.id))
      }
      await refreshRealisations()
      await load()
      toast("Modifications publiées.")
    } catch {
      toast("La publication a échoué. Veuillez réessayer.", "error")
    } finally {
      setPublishing(false)
    }
  }

  const handleDiscard = async () => {
    if (!dirty) return
    const ok = await confirm({
      title: "Annuler les modifications ?",
      message: "Vos modifications non publiées seront perdues.",
      confirmLabel: "Oui, annuler",
      cancelLabel: "Continuer l'édition",
      tone: "danger",
    })
    if (!ok) return
    setDiscarding(true)
    try {
      await load()
      toast("Modifications annulées.")
    } finally {
      setDiscarding(false)
    }
  }

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.source === "cl-preview" && e.data?.type === "edit-realisation") {
        const id = e.data.id as string
        setExpandedId(id)
        rowRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (e: DragEndEvent) => {
    const { active: a, over } = e
    if (!over || a.id === over.id) return
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === a.id)
      const newIndex = prev.findIndex((i) => i.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <ActionBar
        title="Réalisations"
        dirty={dirty}
        publishing={publishing}
        discarding={discarding}
        onPublish={handlePublish}
        onDiscard={handleDiscard}
      />
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[420px] shrink-0 flex-col overflow-y-auto border-r border-border bg-background">
          <p className="border-b border-border px-5 py-3 font-sans text-xs text-foreground-muted">
            Glissez pour réordonner. « Remplacer » change une photo. Rien
            n&apos;est enregistré avant « Publier ».
          </p>
          {loading ? (
            <div className="flex flex-1 items-center justify-center text-foreground-muted">
              <CircleNotch size={24} className="animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="p-5 font-sans text-sm text-foreground-muted">
              Aucune réalisation. Ajoutez-en depuis le tableau de bord.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={() => setExpandedId(null)}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul>
                  {items.map((it) => (
                    <SortableProjectRow
                      key={it.id}
                      item={it}
                      expanded={expandedId === it.id}
                      onToggle={() =>
                        setExpandedId((cur) => (cur === it.id ? null : it.id))
                      }
                      onReplace={(index, file) => handleReplace(it.id, index, file)}
                      onMove={(index, dir) => handleMove(it.id, index, dir)}
                      rowRef={(el) => {
                        rowRefs.current[it.id] = el
                      }}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>
        <PreviewFrame src="/realisations?preview=1" iframeRef={iframeRef} />
      </div>
    </section>
  )
}

function SortableProjectRow({
  item,
  expanded,
  onToggle,
  onReplace,
  onMove,
  rowRef,
}: {
  item: WorkItem
  expanded: boolean
  onToggle: () => void
  onReplace: (index: number, file: File) => void
  onMove: (index: number, dir: -1 | 1) => void
  rowRef: (el: HTMLLIElement | null) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  }

  const v = version(item.updatedAt)
  const managed: ManagedImage[] = item.slots.map((s) => ({
    url: s.dataUrl ?? imgSrc(s.key, v),
    staged: !!s.file,
  }))
  const thumb = managed[0]?.url ?? null

  return (
    <li
      ref={(el) => {
        setNodeRef(el)
        rowRef(el)
      }}
      style={style}
      className={`bg-surface transition-shadow ${
        isDragging
          ? "relative z-20 rounded-xl border border-accent/40 shadow-xl"
          : "border-b border-border last:border-b-0"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Glisser pour réordonner"
          className="cursor-grab touch-none rounded p-1 text-foreground-muted transition-colors hover:text-foreground active:cursor-grabbing"
        >
          <DotsSixVertical size={18} />
        </button>
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-elevated">
          {thumb ? (
            <Image src={thumb} alt={item.name} fill unoptimized sizes="48px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-foreground-muted">
              <ImageSquare size={16} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-sm font-medium text-foreground">
            {item.name}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-muted">
            {item.slots.length} image{item.slots.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label="Modifier les images"
          className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs transition-colors ${
            expanded
              ? "bg-foreground text-white"
              : "border border-border text-foreground hover:bg-surface-elevated"
          }`}
        >
          <PencilSimple size={14} />
          <CaretDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>
      {expanded && (
        <div className="px-4 pb-4">
          <SectionImageManager images={managed} onReplace={onReplace} onMove={onMove} />
        </div>
      )}
    </li>
  )
}

/* ---------- Static section editor (per-slot, staged) ---------- */

function StaticSectionEditor({
  section,
  anchor,
  onDirtyChange,
}: {
  section: string
  anchor?: string
  onDirtyChange: (dirty: boolean) => void
}) {
  const confirm = useConfirm()
  const toast = useToast()

  const [state, setState] = useState<SectionAdminState | null>(null)
  const [loading, setLoading] = useState(true)
  const [staged, setStaged] = useState<Record<string, { file: File; dataUrl: string }>>({})
  const [publishing, setPublishing] = useState(false)
  const [discarding, setDiscarding] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const load = useCallback(async () => {
    try {
      setState(await api.sections.static.get(section))
    } catch (e) {
      console.warn("Chargement de la section impossible:", e)
    } finally {
      setLoading(false)
    }
  }, [section])

  useEffect(() => {
    void (async () => {
      await load()
    })()
  }, [load])

  const dirty = Object.keys(staged).length > 0

  // Report dirtiness up so the page can guard navigation away from the editor;
  // reset on unmount so a switched-away editor never leaves the page stuck dirty.
  useEffect(() => {
    onDirtyChange(dirty)
    return () => onDirtyChange(false)
  }, [dirty, onDirtyChange])

  const pushPreview = useCallback(
    (stagedMap: Record<string, { file: File; dataUrl: string }>) => {
      const overrides: Record<string, string> = {}
      for (const [slot, v] of Object.entries(stagedMap)) overrides[slot] = v.dataUrl
      iframeRef.current?.contentWindow?.postMessage(
        { source: "cl-content-admin", type: "preview-section", section, overrides },
        window.location.origin,
      )
    },
    [section],
  )

  // Ask the preview to scroll to this section's anchor so the admin lands ON it
  // (Savoir-faire, for one, is far down the home page). Sent a few times because
  // the iframe's scroll listener (Lenis) may attach a beat after `onLoad`; the
  // scroll is idempotent so repeats are harmless.
  const postScroll = useCallback(() => {
    if (!anchor) return
    const send = () =>
      iframeRef.current?.contentWindow?.postMessage(
        { source: "cl-content-admin", type: "preview-scroll", anchor },
        window.location.origin,
      )
    send()
    window.setTimeout(send, 300)
    window.setTimeout(send, 800)
  }, [anchor])

  useEffect(() => {
    if (!loading) pushPreview(staged)
  }, [staged, loading, pushPreview])

  const handleReplace = async (slot: string, file: File) => {
    let dataUrl: string
    try {
      dataUrl = await readAsDataUrl(await fileToCompressedBlob(file))
    } catch {
      toast("Image invalide. Veuillez réessayer.", "error")
      return
    }
    setStaged((p) => ({ ...p, [slot]: { file, dataUrl } }))
  }

  const handlePublish = async () => {
    if (!dirty) return
    setPublishing(true)
    try {
      const changes: { slot: string; key: string }[] = []
      for (const [slot, v] of Object.entries(staged)) {
        const key = sectionSlotKey(section, slot)
        await uploadImageToKey(v.file, key)
        changes.push({ slot, key })
      }
      await api.sections.static.publish(section, changes)
      setStaged({})
      await load()
      // Reload the iframe so the server re-renders with the published images.
      const path = state?.previewPath ?? "/"
      if (iframeRef.current) {
        iframeRef.current.src = `${path}?preview=1&t=${Date.now()}`
      }
      toast("Modifications publiées.")
    } catch {
      toast("La publication a échoué. Veuillez réessayer.", "error")
    } finally {
      setPublishing(false)
    }
  }

  const handleDiscard = async () => {
    if (!dirty) return
    const ok = await confirm({
      title: "Annuler les modifications ?",
      message: "Vos modifications non publiées seront perdues.",
      confirmLabel: "Oui, annuler",
      cancelLabel: "Continuer l'édition",
      tone: "danger",
    })
    if (!ok) return
    setDiscarding(true)
    try {
      setStaged({})
      toast("Modifications annulées.")
    } finally {
      setDiscarding(false)
    }
  }

  const previewPath = state?.previewPath ?? "/"

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <ActionBar
        title={state?.label ?? "Section"}
        dirty={dirty}
        publishing={publishing}
        discarding={discarding}
        onPublish={handlePublish}
        onDiscard={handleDiscard}
      />
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[380px] shrink-0 flex-col overflow-y-auto border-r border-border bg-background">
          <p className="border-b border-border px-5 py-3 font-sans text-xs text-foreground-muted">
            « Remplacer » change une image. L&apos;aperçu se met à jour à droite.
            Rien n&apos;est enregistré avant « Publier ».
          </p>
          {loading ? (
            <div className="flex flex-1 items-center justify-center text-foreground-muted">
              <CircleNotch size={24} className="animate-spin" />
            </div>
          ) : !state || state.slots.length === 0 ? (
            <p className="p-5 font-sans text-sm text-foreground-muted">
              Aucune image éditable dans cette section.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {state.slots.map((slot) => (
                <StaticSlotRow
                  key={slot.id}
                  label={slot.label}
                  aspect={slot.aspect}
                  url={staged[slot.id]?.dataUrl ?? slot.url}
                  staged={!!staged[slot.id]}
                  onReplace={(file) => handleReplace(slot.id, file)}
                />
              ))}
            </ul>
          )}
        </div>
        <PreviewFrame
          src={`${previewPath}?preview=1`}
          iframeRef={iframeRef}
          onLoad={() => {
            pushPreview(staged)
            postScroll()
          }}
        />
      </div>
    </section>
  )
}

function StaticSlotRow({
  label,
  aspect,
  url,
  staged,
  onReplace,
}: {
  label: string
  aspect: string
  url: string
  staged: boolean
  onReplace: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <li className="p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-sans text-sm font-medium text-foreground">{label}</span>
        {staged && (
          <span className="rounded-full bg-foreground/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white">
            Modifié
          </span>
        )}
      </div>
      <div
        className="relative overflow-hidden rounded-xl border border-border bg-surface-elevated"
        style={{ aspectRatio: aspect.replace("/", " / ") }}
      >
        {url ? (
          <Image src={url} alt={label} fill unoptimized sizes="360px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-foreground-muted">
            <ImageSquare size={20} />
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-sans text-xs font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-surface-elevated"
      >
        <ArrowsClockwise size={14} />
        Remplacer
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (inputRef.current) inputRef.current.value = ""
          if (f) onReplace(f)
        }}
        className="hidden"
      />
    </li>
  )
}
