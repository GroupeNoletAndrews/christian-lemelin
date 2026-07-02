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
  Crop,
  DotsSixVertical,
  ImageSquare,
  PencilSimple,
  Plus,
  PushPin,
  Stack,
  Trash,
} from "@phosphor-icons/react"
import { useAdmin } from "@/lib/admin-context"
import { api, type SectionAdminState, type SectionSlotChange } from "@/lib/api"
import { imgSrc } from "@/lib/media"
import { sectionSlotKey } from "@/lib/sections-registry"
import { fileToCompressedBlob } from "@/lib/image-utils"
import { uploadImageToKey } from "@/lib/uploads"
import {
  SectionImageManager,
  type ManagedImage,
} from "@/components/admin/SectionImageManager"
import { useConfirm, useToast } from "@/components/admin/FeedbackProvider"
import { jobSchema, yupErrors } from "@/lib/forms"
import { useUnsavedChanges } from "@/components/admin/use-unsaved-changes"
import { JobPreview } from "@/components/admin/JobPreview"
import { StorageMeter } from "@/components/admin/StorageMeter"
import { ReframeModal } from "@/components/admin/ReframeModal"
import { slotBoxCss, slotImgCss, type SlotStyle } from "@/lib/section-style"
import {
  REALISATIONS_LAYOUTS,
  REALISATIONS_LAYOUT_LABELS,
  APROPOS_LAYOUTS,
  APROPOS_LAYOUT_LABELS,
  SETTING_KEYS,
  asRealisationsLayout,
  asAProposLayout,
  DEFAULT_REALISATIONS_HOME_LAYOUT,
  DEFAULT_REALISATIONS_COLLECTION_LAYOUT,
  type RealisationsLayout,
  type AProposLayout,
} from "@/lib/layouts"
import type { Job } from "@/types/admin"

// Editable content grouped BY PAGE (mirrors the real site), plus DB-backed
// COLLECTIONS (Réalisations, Emplois) managed in dedicated editors. A component
// with photos is listed under the page it appears on (repeats allowed). `anchor`
// is the DOM id of the section on its page: the preview scrolls there on load
// (e.g. Savoir-faire sits far down the home page). `enabled` = wired in.
type SectionEntry = {
  id: string
  label: string
  enabled: boolean
  /** DOM id of the section on its page; the preview scrolls here on load. */
  anchor?: string
  /** For réalisations: which surface this entry edits (home grid vs collection). */
  context?: "home" | "collection"
}
type PageGroup = { page: string; sections: SectionEntry[] }

// Pages → the photo-bearing components rendered on them. (Matériaux lives on the
// home page, NOT /fabrication — that page is text-only.) Réalisations appears
// under BOTH Accueil (home grid) and Collections (full collection) — same data,
// each entry previews its own surface + layout.
const PAGES: PageGroup[] = [
  {
    page: "Accueil",
    sections: [
      { id: "savoir-faire", label: "Savoir-faire", enabled: true, anchor: "savoir-faire" },
      {
        id: "realisations-home",
        label: "Réalisations",
        enabled: true,
        anchor: "realisations",
        context: "home",
      },
      { id: "materiaux", label: "Matériaux", enabled: true, anchor: "materiaux" },
    ],
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
    page: "Solutions",
    sections: [{ id: "solutions", label: "Solutions", enabled: true, anchor: "solutions" }],
  },
  {
    page: "Connexion admin",
    sections: [{ id: "admin-login", label: "Image de connexion", enabled: true }],
  },
]

// DB-backed collections managed in their own editors. Réalisations also appears
// under Accueil (home grid); here it edits the full /realisations collection.
const COLLECTIONS: SectionEntry[] = [
  { id: "realisations", label: "Réalisations", enabled: true, context: "collection" },
  { id: "emplois", label: "Emplois", enabled: true },
]

// Flat lookup of an entry's metadata by id (active state is an entry id).
const SECTION_BY_ID: Record<string, SectionEntry> = Object.fromEntries(
  [...PAGES.flatMap((p) => p.sections), ...COLLECTIONS].map((s) => [s.id, s]),
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

  const navButton = (s: SectionEntry) => (
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
        <span className="font-mono text-[9px] uppercase tracking-[0.1em]">bientôt</span>
      )}
    </button>
  )

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
        <nav className="flex-1 space-y-6 overflow-y-auto p-3">
          <div>
            <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-muted">
              Pages
            </p>
            <div className="space-y-4">
              {PAGES.map((group) => (
                <div key={group.page}>
                  <p className="px-2 pb-1.5 font-sans text-[11px] font-medium text-foreground-muted">
                    {group.page}
                  </p>
                  <ul className="space-y-1">
                    {group.sections.map((s) => (
                      <li key={s.id}>{navButton(s)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-muted">
              Collections
            </p>
            <ul className="space-y-1">
              {COLLECTIONS.map((s) => (
                <li key={s.id}>{navButton(s)}</li>
              ))}
            </ul>
          </div>
        </nav>
        <StorageMeter />
      </aside>

      {active === "realisations" || active === "realisations-home" ? (
        <RealisationsEditor
          key={active}
          context={SECTION_BY_ID[active]?.context === "home" ? "home" : "collection"}
          onDirtyChange={setDirty}
        />
      ) : active === "emplois" ? (
        <JobsEditor onDirtyChange={setDirty} />
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
  inCollection: boolean
  createdAt: string
  updatedAt: string
  slots: ImgSlot[]
}

function RealisationsEditor({
  context,
  onDirtyChange,
}: {
  context: "home" | "collection"
  onDirtyChange: (dirty: boolean) => void
}) {
  const { refreshRealisations, togglePinned, toggleInCollection, deleteRealisation, maxPinned } =
    useAdmin()
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

  const isHome = context === "home"
  const layoutKey = isHome
    ? SETTING_KEYS.realisationsHomeLayout
    : SETTING_KEYS.realisationsCollectionLayout
  const defaultLayout = isHome
    ? DEFAULT_REALISATIONS_HOME_LAYOUT
    : DEFAULT_REALISATIONS_COLLECTION_LAYOUT

  // Layout is STAGED: changing it only previews (via the ?layout/?rlayout query
  // the public pages honour in preview) — it goes live on Publish.
  const [savedLayout, setSavedLayout] = useState<RealisationsLayout>(defaultLayout)
  const [stagedLayout, setStagedLayout] = useState<RealisationsLayout>(defaultLayout)
  useEffect(() => {
    api.settings
      .get()
      .then((s) => {
        const v = asRealisationsLayout(s[layoutKey], defaultLayout)
        setSavedLayout(v)
        setStagedLayout(v)
      })
      .catch(() => {})
  }, [layoutKey, defaultLayout])

  // Declarative preview URL: it carries the STAGED layout, so changing the
  // picker re-renders → the iframe reloads with the new layout (no persist).
  const previewSrc = isHome
    ? `/?preview=1&rlayout=${stagedLayout}`
    : `/realisations?preview=1&layout=${stagedLayout}`

  // Home preview loads "/", so scroll it to the réalisations section on load.
  const postScroll = useCallback(() => {
    if (!isHome) return
    const send = () =>
      iframeRef.current?.contentWindow?.postMessage(
        { source: "cl-content-admin", type: "preview-scroll", anchor: "realisations" },
        window.location.origin,
      )
    send()
    window.setTimeout(send, 300)
    window.setTimeout(send, 800)
  }, [isHome])

  const load = useCallback(async () => {
    try {
      const rows = await api.realisations.list()
      setItems(
        rows.map((r) => ({
          id: r.id,
          name: r.name,
          pinned: r.pinned,
          inCollection: r.inCollection ?? true,
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
          inCollection: it.inCollection,
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
    if (stagedLayout !== savedLayout) return true
    if (items.map((i) => i.id).join(",") !== original.order.join(",")) return true
    for (const it of items) {
      if (it.slots.some((s) => s.file)) return true
      if (it.slots.map((s) => s.key).join(",") !== (original.images[it.id] ?? []).join(","))
        return true
    }
    return false
  }, [items, original, stagedLayout, savedLayout])

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
          inCollection: it.inCollection,
        })
      }
      if (items.map((i) => i.id).join(",") !== o.order.join(",")) {
        await api.realisations.reorder(items.map((i) => i.id))
      }
      // Persist the staged layout only now (Publish makes it live).
      if (stagedLayout !== savedLayout) {
        await api.settings.set({ [layoutKey]: stagedLayout })
        setSavedLayout(stagedLayout)
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
      setStagedLayout(savedLayout)
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

  // Pin/delete are immediate (they don't go through the staged publish flow), so
  // update local state in place — never reload, which would drop staged edits.
  const handleTogglePin = async (id: string) => {
    const ok = await togglePinned(id)
    if (!ok) {
      toast(`Limite atteinte : maximum ${maxPinned} réalisations épinglées.`, "error")
      return
    }
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, pinned: !it.pinned } : it)))
  }

  const handleToggleCollection = async (id: string) => {
    try {
      await toggleInCollection(id)
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, inCollection: !it.inCollection } : it)),
      )
    } catch {
      toast("L'action a échoué. Veuillez réessayer.", "error")
    }
  }

  const handleDeleteItem = async (id: string, name: string) => {
    const ok = await confirm({
      title: "Supprimer cette réalisation ?",
      message: `« ${name} » et ses images seront supprimées définitivement.`,
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      tone: "danger",
    })
    if (!ok) return
    try {
      await deleteRealisation(id)
      setItems((prev) => prev.filter((it) => it.id !== id))
      setOriginal((o) => ({
        order: o.order.filter((x) => x !== id),
        images: Object.fromEntries(Object.entries(o.images).filter(([k]) => k !== id)),
      }))
      if (expandedId === id) setExpandedId(null)
      toast("Réalisation supprimée.")
    } catch {
      toast("La suppression a échoué. Veuillez réessayer.", "error")
    }
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
          <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
            <p className="font-sans text-xs text-foreground-muted">
              Glissez pour réordonner · « Publier » enregistre.
            </p>
            <Link
              href="/admin/dashboard/realisations/create/edit"
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-3 py-1.5 font-sans text-xs font-medium text-white transition-colors hover:bg-accent-hover"
            >
              <Plus size={13} weight="bold" />
              Ajouter
            </Link>
          </div>
          {/* Layout picker for THIS surface (Accueil grid vs Collection grid).
              Staged: it previews live but only goes live on « Publier ». */}
          <div className="border-b border-border px-5 py-3">
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
                Grille — {isHome ? "Accueil" : "Collection"}
              </span>
              <select
                value={stagedLayout}
                onChange={(e) => setStagedLayout(e.target.value as RealisationsLayout)}
                className="w-full rounded-lg border border-border bg-background px-2 py-1.5 font-sans text-xs text-foreground focus:border-foreground/30 focus:outline-none"
              >
                {REALISATIONS_LAYOUTS.map((l) => (
                  <option key={l} value={l}>
                    {REALISATIONS_LAYOUT_LABELS[l]}
                  </option>
                ))}
              </select>
            </label>
            {stagedLayout !== savedLayout && (
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-muted">
                Aperçu — appliqué à la publication
              </p>
            )}
          </div>
          {loading ? (
            <div className="flex flex-1 items-center justify-center text-foreground-muted">
              <CircleNotch size={24} className="animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="p-5 font-sans text-sm text-foreground-muted">
              Aucune réalisation. Cliquez « Ajouter » pour en créer une.
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
                      onTogglePin={() => void handleTogglePin(it.id)}
                      onToggleCollection={() => void handleToggleCollection(it.id)}
                      onDelete={() => void handleDeleteItem(it.id, it.name)}
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
        <PreviewFrame
          src={previewSrc}
          iframeRef={iframeRef}
          onLoad={() => {
            pushPreview(items)
            postScroll()
          }}
        />
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
  onTogglePin,
  onToggleCollection,
  onDelete,
  rowRef,
}: {
  item: WorkItem
  expanded: boolean
  onToggle: () => void
  onReplace: (index: number, file: File) => void
  onMove: (index: number, dir: -1 | 1) => void
  onTogglePin: () => void
  onToggleCollection: () => void
  onDelete: () => void
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
          ? "relative z-20 rounded-xl border border-accent/40"
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
          <p className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-muted">
            {item.pinned && (
              <span className="inline-flex items-center gap-0.5 text-foreground">
                <PushPin size={10} weight="fill" />
                Accueil
              </span>
            )}
            {item.inCollection && (
              <span className="inline-flex items-center gap-0.5 text-foreground">
                <Stack size={10} weight="fill" />
                Collection
              </span>
            )}
            {!item.pinned && !item.inCollection && (
              <span className="text-foreground-muted/70">Masquée</span>
            )}
            <span>· {item.slots.length} image{item.slots.length > 1 ? "s" : ""}</span>
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onTogglePin}
            aria-label={item.pinned ? "Retirer de l'accueil" : "Afficher sur l'accueil"}
            title={item.pinned ? "Retirer de l'accueil" : "Afficher sur l'accueil"}
            className={`rounded p-1.5 transition-colors ${
              item.pinned ? "text-foreground" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            <PushPin size={16} weight={item.pinned ? "fill" : "regular"} />
          </button>
          <button
            type="button"
            onClick={onToggleCollection}
            aria-label={item.inCollection ? "Retirer de la collection" : "Ajouter à la collection"}
            title={item.inCollection ? "Retirer de la collection" : "Ajouter à la collection"}
            className={`rounded p-1.5 transition-colors ${
              item.inCollection ? "text-foreground" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            <Stack size={16} weight={item.inCollection ? "fill" : "regular"} />
          </button>
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
          <button
            type="button"
            onClick={onDelete}
            aria-label="Supprimer"
            className="rounded p-1.5 text-foreground-muted transition-colors hover:text-red-600"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4">
          <SectionImageManager images={managed} onReplace={onReplace} onMove={onMove} />
          <Link
            href={`/admin/dashboard/realisations/${item.id}/edit`}
            className="mt-3 inline-block font-sans text-xs font-medium text-foreground underline-offset-4 hover:underline"
          >
            Renommer / détails complets →
          </Link>
        </div>
      )}
    </li>
  )
}

/* ---------- Emplois editor (DB-backed, immediate CRUD) ---------- */

type JobForm = Omit<Job, "id" | "createdAt" | "updatedAt">
const EMPTY_JOB: JobForm = {
  title: "",
  description: "",
  location: "",
  type: "full-time",
  department: "",
  salary: "",
}
const jobTypeLabel = (t: string) =>
  t === "full-time"
    ? "Temps plein"
    : t === "part-time"
      ? "Temps partiel"
      : t === "contract"
        ? "Contrat"
        : t

function JobsEditor({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const { jobs, addJob, updateJob, deleteJob } = useAdmin()
  const confirm = useConfirm()
  const toast = useToast()
  const [editing, setEditing] = useState<string | "new" | null>(null)
  const [form, setForm] = useState<JobForm>(EMPTY_JOB)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const current =
    editing && editing !== "new" ? (jobs.find((j) => j.id === editing) ?? null) : null

  const dirty =
    editing === "new"
      ? Object.values(form).some((v) => (v ?? "").toString().trim() !== "")
      : !!current &&
        (form.title !== current.title ||
          form.description !== current.description ||
          form.location !== current.location ||
          form.type !== current.type ||
          form.department !== current.department ||
          (form.salary ?? "") !== (current.salary ?? ""))

  // Report dirtiness up so switching editors warns; reset on unmount.
  useEffect(() => {
    onDirtyChange(dirty)
    return () => onDirtyChange(false)
  }, [dirty, onDirtyChange])

  const startNew = () => {
    setForm(EMPTY_JOB)
    setEditing("new")
    setErrors({})
  }
  const startEdit = (job: Job) => {
    setForm({
      title: job.title,
      description: job.description,
      location: job.location,
      type: job.type,
      department: job.department,
      salary: job.salary ?? "",
    })
    setEditing(job.id)
    setErrors({})
  }
  const cancel = () => {
    setEditing(null)
    setForm(EMPTY_JOB)
    setErrors({})
  }
  const set =
    (k: keyof JobForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validation Yup (le <form> est noValidate — pas de validation navigateur).
    const fieldErrors = await yupErrors(jobSchema, form)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return
    setSaving(true)
    try {
      if (editing === "new") {
        await addJob(form)
        toast("Emploi créé.")
      } else if (editing) {
        await updateJob(editing, { ...form, updatedAt: new Date() })
        toast("Emploi mis à jour.")
      }
      setEditing(null)
      setForm(EMPTY_JOB)
    } catch {
      toast("L'enregistrement a échoué. Veuillez réessayer.", "error")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (job: Job) => {
    const ok = await confirm({
      title: "Supprimer cet emploi ?",
      message: `« ${job.title} » sera définitivement retiré du site.`,
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      tone: "danger",
    })
    if (!ok) return
    try {
      await deleteJob(job.id)
      if (editing === job.id) cancel()
      toast("Emploi supprimé.")
    } catch {
      toast("La suppression a échoué.", "error")
    }
  }

  const labelClass =
    "mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-foreground-muted"
  const fieldClass =
    "w-full rounded-lg border bg-background px-3.5 py-2.5 font-sans text-sm text-foreground placeholder-foreground-muted transition-colors focus:border-foreground/30 focus:outline-none"
  const fieldBorder = (key: string) => (errors[key] ? "border-red-400" : "border-border")
  const fieldError = (key: string) =>
    errors[key] ? <p className="mt-1.5 font-sans text-xs text-red-600">{errors[key]}</p> : null

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-4">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
          Emplois
        </h2>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.99]"
        >
          <Plus size={16} weight="bold" />
          Nouvel emploi
        </button>
      </header>
      <div className="flex min-h-0 flex-1">
        {/* List */}
        <div className="flex w-[380px] shrink-0 flex-col overflow-y-auto border-r border-border bg-background">
          {jobs.length === 0 ? (
            <p className="p-5 font-sans text-sm text-foreground-muted">
              Aucun emploi. Cliquez « Nouvel emploi » pour en ajouter un.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {jobs.map((job) => (
                <li
                  key={job.id}
                  className={editing === job.id ? "bg-surface-elevated" : "bg-surface"}
                >
                  <div className="flex items-center gap-2 px-4 py-3">
                    <button
                      onClick={() => startEdit(job)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate font-sans text-sm font-medium text-foreground">
                        {job.title}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-muted">
                        {job.department} · {jobTypeLabel(job.type)}
                      </p>
                    </button>
                    <button
                      onClick={() => startEdit(job)}
                      aria-label="Modifier"
                      className="rounded p-1.5 text-foreground-muted transition-colors hover:text-foreground"
                    >
                      <PencilSimple size={16} />
                    </button>
                    <button
                      onClick={() => void remove(job)}
                      aria-label="Supprimer"
                      className="rounded p-1.5 text-foreground-muted transition-colors hover:text-red-600"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Form + live preview */}
        <div className="min-w-0 flex-1 overflow-y-auto bg-surface-elevated p-6">
          {editing === null ? (
            <div className="flex h-full items-center justify-center text-center">
              <p className="max-w-[32ch] font-sans text-sm text-foreground-muted">
                Sélectionnez un emploi à modifier, ou créez‑en un nouveau.
              </p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.4fr_1fr]">
              <form
                onSubmit={save}
                noValidate
                className="space-y-5 rounded-2xl border border-border bg-surface p-6"
              >
                <div>
                  <label className={labelClass}>
                    Titre du poste <span className="text-accent">*</span>
                  </label>
                  <input
                    value={form.title}
                    onChange={set("title")}
                    placeholder="Ex: Ingénieur Fabrication"
                    aria-invalid={!!errors.title}
                    className={`${fieldClass} ${fieldBorder("title")}`}
                  />
                  {fieldError("title")}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Département <span className="text-accent">*</span>
                    </label>
                    <input
                      value={form.department}
                      onChange={set("department")}
                      placeholder="Ex: Production"
                      aria-invalid={!!errors.department}
                      className={`${fieldClass} ${fieldBorder("department")}`}
                    />
                    {fieldError("department")}
                  </div>
                  <div>
                    <label className={labelClass}>
                      Type <span className="text-accent">*</span>
                    </label>
                    <select value={form.type} onChange={set("type")} className={`${fieldClass} border-border`}>
                      <option value="full-time">Temps plein</option>
                      <option value="part-time">Temps partiel</option>
                      <option value="contract">Contrat</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Localisation <span className="text-accent">*</span>
                    </label>
                    <input
                      value={form.location}
                      onChange={set("location")}
                      placeholder="Ex: Québec, QC"
                      aria-invalid={!!errors.location}
                      className={`${fieldClass} ${fieldBorder("location")}`}
                    />
                    {fieldError("location")}
                  </div>
                  <div>
                    <label className={labelClass}>
                      Salaire{" "}
                      <span className="normal-case tracking-normal text-foreground-muted">
                        (optionnel)
                      </span>
                    </label>
                    <input
                      value={form.salary}
                      onChange={set("salary")}
                      placeholder="Ex: 65 000 – 85 000 $/an"
                      className={`${fieldClass} border-border`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    Description <span className="text-accent">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={set("description")}
                    rows={6}
                    placeholder="Responsabilités, qualifications requises…"
                    aria-invalid={!!errors.description}
                    className={`${fieldClass} ${fieldBorder("description")} resize-none`}
                  />
                  {fieldError("description")}
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={cancel}
                    className="rounded-full border border-border px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-surface-elevated"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !dirty}
                    className="rounded-full bg-accent px-5 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving
                      ? "Enregistrement…"
                      : editing === "new"
                        ? "Créer l'emploi"
                        : "Mettre à jour"}
                  </button>
                </div>
              </form>
              <div className="h-fit rounded-2xl border border-border bg-surface p-6">
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                  Aperçu
                </p>
                <JobPreview job={form} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
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
  // Staged presentation per slot: a SlotStyle to set, or null to reset.
  const [stagedStyle, setStagedStyle] = useState<Record<string, SlotStyle | null>>({})
  const [modalSlot, setModalSlot] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [discarding, setDiscarding] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // À-propos has a selectable page layout (other sections don't). It is STAGED:
  // the picker previews via ?layout, and only goes live on Publish.
  const hasLayout = section === "a-propos"
  const [savedAproposLayout, setSavedAproposLayout] = useState<AProposLayout>("bento")
  const [aproposLayout, setAproposLayout] = useState<AProposLayout>("bento")
  useEffect(() => {
    if (!hasLayout) return
    api.settings
      .get()
      .then((s) => {
        const v = asAProposLayout(s[SETTING_KEYS.aproposLayout])
        setSavedAproposLayout(v)
        setAproposLayout(v)
      })
      .catch(() => {})
  }, [hasLayout])

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

  const dirty =
    Object.keys(staged).length > 0 ||
    Object.keys(stagedStyle).length > 0 ||
    (hasLayout && aproposLayout !== savedAproposLayout)

  // Report dirtiness up so the page can guard navigation away from the editor;
  // reset on unmount so a switched-away editor never leaves the page stuck dirty.
  useEffect(() => {
    onDirtyChange(dirty)
    return () => onDirtyChange(false)
  }, [dirty, onDirtyChange])

  const pushPreview = useCallback(
    (
      stagedMap: Record<string, { file: File; dataUrl: string }>,
      styleMap: Record<string, SlotStyle | null>,
    ) => {
      const overrides: Record<string, string> = {}
      for (const [slot, v] of Object.entries(stagedMap)) overrides[slot] = v.dataUrl
      // null (reset) → {} so the preview clears the published style live.
      const styles: Record<string, SlotStyle> = {}
      for (const [slot, v] of Object.entries(styleMap)) styles[slot] = v ?? {}
      iframeRef.current?.contentWindow?.postMessage(
        { source: "cl-content-admin", type: "preview-section", section, overrides, styles },
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
    if (!loading) pushPreview(staged, stagedStyle)
  }, [staged, stagedStyle, loading, pushPreview])

  const handleReplace = async (slot: string, file: File) => {
    let dataUrl: string
    try {
      dataUrl = await readAsDataUrl(await fileToCompressedBlob(file))
    } catch (e) {
      toast(e instanceof Error ? e.message : "Image invalide. Veuillez réessayer.", "error")
      return
    }
    setStaged((p) => ({ ...p, [slot]: { file, dataUrl } }))
  }

  const handleApplyStyle = (slot: string, style: SlotStyle | null) => {
    setStagedStyle((p) => ({ ...p, [slot]: style }))
    setModalSlot(null)
  }

  const handlePublish = async () => {
    if (!dirty) return
    setPublishing(true)
    try {
      const slotIds = new Set([...Object.keys(staged), ...Object.keys(stagedStyle)])
      const changes: SectionSlotChange[] = []
      for (const slot of slotIds) {
        const change: SectionSlotChange = { slot }
        const file = staged[slot]?.file
        if (file) {
          const key = sectionSlotKey(section, slot)
          await uploadImageToKey(file, key)
          change.key = key
        }
        // Only include style when the admin actually touched it (null = reset).
        if (slot in stagedStyle) change.style = stagedStyle[slot]
        changes.push(change)
      }
      await api.sections.static.publish(section, changes)
      // Persist the staged à-propos layout only now (Publish makes it live).
      if (hasLayout && aproposLayout !== savedAproposLayout) {
        await api.settings.set({ [SETTING_KEYS.aproposLayout]: aproposLayout })
        setSavedAproposLayout(aproposLayout)
      }
      setStaged({})
      setStagedStyle({})
      await load()
      // Reload the iframe so the server re-renders with the published images.
      const path = state?.previewPath ?? "/"
      if (iframeRef.current) {
        const q = hasLayout ? `&layout=${aproposLayout}` : ""
        iframeRef.current.src = `${path}?preview=1${q}&t=${Date.now()}`
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
      setStagedStyle({})
      setAproposLayout(savedAproposLayout)
      toast("Modifications annulées.")
    } finally {
      setDiscarding(false)
    }
  }

  const previewPath = state?.previewPath ?? "/"
  // À-propos: carry the STAGED layout in the preview URL so the picker previews
  // it live without persisting (declarative → reloads on change).
  const previewSrc = hasLayout
    ? `${previewPath}?preview=1&layout=${aproposLayout}`
    : `${previewPath}?preview=1`
  const caps = state?.caps ?? { reframe: false, filter: false, style: false }
  const modalSlotState = modalSlot ? state?.slots.find((s) => s.id === modalSlot) : undefined
  const modalCurrentStyle = modalSlot
    ? modalSlot in stagedStyle
      ? stagedStyle[modalSlot]
      : (modalSlotState?.style ?? null)
    : null

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
            « Remplacer » change une image, « Recadrer » ajuste cadrage et style.
            L&apos;aperçu se met à jour à droite. Rien n&apos;est enregistré avant
            « Publier ».
          </p>
          {hasLayout && (
            <label className="block border-b border-border px-5 py-3">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
                Disposition de la page
              </span>
              <select
                value={aproposLayout}
                onChange={(e) => setAproposLayout(e.target.value as AProposLayout)}
                className="w-full rounded-lg border border-border bg-background px-2 py-1.5 font-sans text-xs text-foreground focus:border-foreground/30 focus:outline-none"
              >
                {APROPOS_LAYOUTS.map((l) => (
                  <option key={l} value={l}>
                    {APROPOS_LAYOUT_LABELS[l]}
                  </option>
                ))}
              </select>
            </label>
          )}
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
              {state.slots.map((slot) => {
                const styleChanged = slot.id in stagedStyle
                const currentStyle = styleChanged ? stagedStyle[slot.id] : slot.style
                return (
                  <StaticSlotRow
                    key={slot.id}
                    label={slot.label}
                    aspect={slot.aspect}
                    url={staged[slot.id]?.dataUrl ?? slot.url}
                    imageChanged={!!staged[slot.id]}
                    styleChanged={styleChanged}
                    currentStyle={currentStyle}
                    grayscaleDefault={slot.grayscaleDefault}
                    // Reframe needs a real image (published key or a staged file).
                    canReframe={caps.reframe && (!!slot.publishedKey || !!staged[slot.id])}
                    onReplace={(file) => handleReplace(slot.id, file)}
                    onReframe={() => setModalSlot(slot.id)}
                  />
                )
              })}
            </ul>
          )}
        </div>
        <PreviewFrame
          src={previewSrc}
          iframeRef={iframeRef}
          onLoad={() => {
            pushPreview(staged, stagedStyle)
            postScroll()
          }}
        />
      </div>
      {modalSlotState && (
        <ReframeModal
          open
          src={staged[modalSlotState.id]?.dataUrl ?? modalSlotState.url}
          aspect={modalSlotState.aspect}
          caps={caps}
          grayscaleDefault={modalSlotState.grayscaleDefault}
          initial={modalCurrentStyle}
          onClose={() => setModalSlot(null)}
          onApply={(style) => handleApplyStyle(modalSlotState.id, style)}
        />
      )}
    </section>
  )
}

function StaticSlotRow({
  label,
  aspect,
  url,
  imageChanged,
  styleChanged,
  currentStyle,
  grayscaleDefault,
  canReframe,
  onReplace,
  onReframe,
}: {
  label: string
  aspect: string
  url: string
  imageChanged: boolean
  styleChanged: boolean
  currentStyle: SlotStyle | null | undefined
  grayscaleDefault: boolean
  canReframe: boolean
  onReplace: (file: File) => void
  onReframe: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const gray = currentStyle?.grayscale ?? grayscaleDefault
  return (
    <li className="p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-sans text-sm font-medium text-foreground">{label}</span>
        {(imageChanged || styleChanged) && (
          <span className="rounded-full bg-foreground/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white">
            {imageChanged ? "Modifié" : "Recadré"}
          </span>
        )}
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const f = e.dataTransfer.files?.[0]
          if (f) onReplace(f)
        }}
        className={`relative overflow-hidden border bg-surface-elevated transition-colors ${
          dragOver ? "border-accent ring-2 ring-accent/40" : "border-border"
        }`}
        style={{ aspectRatio: aspect.replace("/", " / "), ...slotBoxCss(currentStyle) }}
      >
        {url ? (
          <Image
            src={url}
            alt={label}
            fill
            unoptimized
            sizes="360px"
            className={`object-cover${gray ? " grayscale" : ""}`}
            style={slotImgCss(currentStyle)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-foreground-muted">
            <ImageSquare size={20} />
          </div>
        )}
        {dragOver && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-foreground/40 font-mono text-[10px] uppercase tracking-[0.14em] text-white">
            Déposer pour remplacer
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-sans text-xs font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-surface-elevated"
        >
          <ArrowsClockwise size={14} />
          Remplacer
        </button>
        <button
          type="button"
          onClick={onReframe}
          disabled={!canReframe}
          title={canReframe ? undefined : "Remplacez d'abord l'image pour la recadrer"}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-sans text-xs font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Crop size={14} />
          Recadrer
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
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
