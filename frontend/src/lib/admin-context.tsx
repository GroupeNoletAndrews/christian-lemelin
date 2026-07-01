"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
  ReactNode,
} from "react"
import { Job, Realisation, MAX_PINNED_REALISATIONS } from "@/types/admin"
import type { User } from "@supabase/supabase-js"
import { api, ApiError, ApiJob, ApiRealisation } from "@/lib/api"
import { supabaseBrowser } from "@/lib/supabase/client"
import { isAllowedAdmin } from "@/lib/auth-allowlist"

interface AdminContextType {
  isAuthenticated: boolean
  /** True until the initial Supabase session check resolves — gate redirects on this. */
  authLoading: boolean
  email: string
  jobs: Job[]
  /** Resolves the sign-in outcome. `mustChangePassword` is true when the user
   *  was created with a temporary password and has to set their own first. */
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; mustChangePassword: boolean }>
  logout: () => void
  /** True while the signed-in user still has to replace a temporary password. */
  mustChangePassword: boolean
  /** Set a new password for the signed-in user and clear the must-change flag. */
  changePassword: (newPassword: string) => Promise<void>
  addJob: (job: Omit<Job, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateJob: (id: string, job: Omit<Job, "id" | "createdAt">) => Promise<void>
  deleteJob: (id: string) => Promise<void>
  getJob: (id: string) => Job | undefined
  // Réalisations
  realisations: Realisation[]
  pinnedCount: number
  maxPinned: number
  addRealisation: (
    data: Omit<Realisation, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>
  updateRealisation: (
    id: string,
    data: Omit<Realisation, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>
  deleteRealisation: (id: string) => Promise<void>
  getRealisation: (id: string) => Realisation | undefined
  /** Toggle pinned state. Returns false if it would exceed the pin limit. */
  togglePinned: (id: string) => Promise<boolean>
  /** Persist a new réalisations order (drag-and-drop). Optimistic, reverts on failure. */
  reorderRealisations: (orderedIds: string[]) => Promise<void>
  /** Re-fetch réalisations from the server into the shared state — so surfaces
   *  that mutate them outside the provider (e.g. the content workspace publish)
   *  resync the dashboard/home without a full reload. */
  refreshRealisations: () => Promise<void>
  /** True only inside the content workspace preview iframe (URL carries ?preview):
   *  public sections render in-place edit affordances (pencils) when set. */
  previewEdit: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

// ---- Revive API payloads (ISO date strings) into the app's Date-based types ----

function reviveJob(j: ApiJob): Job {
  return {
    id: j.id,
    title: j.title,
    description: j.description,
    location: j.location,
    type: j.type as Job["type"],
    department: j.department,
    salary: j.salary,
    createdAt: new Date(j.createdAt),
    updatedAt: new Date(j.updatedAt),
  }
}

function reviveRealisation(r: ApiRealisation): Realisation {
  return {
    id: r.id,
    name: r.name,
    images: Array.isArray(r.images) ? r.images : [],
    pinned: r.pinned,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  }
}

// Read ?preview from the URL without a hydration mismatch: the server snapshot
// is always undefined, and the client switches to the real value after
// hydration. Truthy only inside the content workspace preview iframe.
const subscribePreview = () => () => {}
function usePreviewToken(): string | undefined {
  return useSyncExternalStore(
    subscribePreview,
    () => new URLSearchParams(window.location.search).get("preview") ?? undefined,
    () => undefined,
  )
}

/** A user the admin flagged (via Supabase user metadata) to set their own
 *  password on first login — see the README admin section. */
function mustChangePasswordFor(user: User | null): boolean {
  return user?.user_metadata?.must_change_password === true
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [realisations, setRealisations] = useState<Realisation[]>([])
  // From the URL (?preview), hydration-safe — true only inside the content
  // workspace preview iframe, where public sections show in-place edit pencils.
  const previewToken = usePreviewToken()
  const previewEdit = previewToken !== undefined

  // Hydrate jobs + restore the Supabase admin session on mount.
  useEffect(() => {
    let cancelled = false
    api.jobs
      .list()
      .then((rows) => {
        if (!cancelled) setJobs(rows.map(reviveJob))
      })
      .catch((e) => console.warn("Chargement des emplois impossible:", e))

    // Restore + track the Supabase session. getSession() reads the @supabase/ssr
    // cookie (no network) for an instant initial answer; onAuthStateChange keeps
    // it in sync (SIGNED_IN/OUT/TOKEN_REFRESHED). A hard timeout guarantees the
    // UI never hangs if the client init stalls. The server (requireAdmin/proxy
    // via getUser) remains the real validator — this only drives the UI.
    const supabase = supabaseBrowser()
    const applyUser = (user: User | null) => {
      if (cancelled) return
      const ok = isAllowedAdmin(user)
      setIsAuthenticated(ok)
      setEmail(ok ? (user?.email ?? "") : "")
      setMustChangePassword(ok && mustChangePasswordFor(user))
      setAuthLoading(false)
    }
    supabase.auth
      .getSession()
      .then(({ data }) => applyUser(data.session?.user ?? null))
      .catch(() => {
        if (!cancelled) setAuthLoading(false)
      })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      applyUser(session?.user ?? null),
    )
    // Safety net: never leave the admin stuck on a blank loader.
    const settle = setTimeout(() => {
      if (!cancelled) setAuthLoading(false)
    }, 2500)

    return () => {
      cancelled = true
      clearTimeout(settle)
      subscription.unsubscribe()
    }
  }, [])

  // Load réalisations (live, or draft-merged inside the preview iframe). Exposed
  // as refreshRealisations so other admin surfaces (e.g. the content workspace
  // after publishing) can resync the shared list without a full reload.
  const loadRealisations = useCallback(async () => {
    try {
      const rows = await api.realisations.list(previewToken)
      setRealisations(rows.map(reviveRealisation))
    } catch (e) {
      console.warn("Chargement des réalisations impossible:", e)
    }
  }, [previewToken])

  // Initial load + (in the preview iframe) refresh on the workspace's postMessage
  // so pending edits appear without a full reload (which replays the preloader).
  useEffect(() => {
    void (async () => {
      await loadRealisations()
    })()

    if (!previewToken || typeof window === "undefined") return
    const onPreviewMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.source !== "cl-content-admin") return
      if (e.data.type === "refresh-realisations") {
        // Re-fetch the live list (after publish/cancel).
        void loadRealisations()
      } else if (
        e.data.type === "preview-realisations" &&
        Array.isArray(e.data.data)
      ) {
        // Apply the workspace's staged (un-published) state for live preview —
        // staged images arrive as data: URLs and render directly.
        setRealisations((e.data.data as ApiRealisation[]).map(reviveRealisation))
      }
    }
    window.addEventListener("message", onPreviewMessage)
    return () => window.removeEventListener("message", onPreviewMessage)
  }, [previewToken, loadRealisations])

  // Re-fetch réalisations when a tab becomes visible again, so a page left open
  // before a publish in another tab shows the new images on return. Skipped in
  // the preview iframe (driven by the workspace via postMessage).
  useEffect(() => {
    if (previewToken || typeof document === "undefined") return
    const onVisible = () => {
      if (document.visibilityState === "visible") void loadRealisations()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [previewToken, loadRealisations])

  const login = useCallback(async (loginEmail: string, password: string) => {
    const supabase = supabaseBrowser()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    })
    // Invalid credentials → not ok (caller shows "identifiants invalides").
    if (error) {
      if (error.status === 400 || error.status === 401)
        return { ok: false, mustChangePassword: false }
      // Network / server / config error — re-throw for a distinct message.
      throw error
    }
    // Authenticated, but enforce the allowlist (defence in depth).
    if (!isAllowedAdmin(data.user)) {
      await supabase.auth.signOut()
      return { ok: false, mustChangePassword: false }
    }
    const mustChange = mustChangePasswordFor(data.user)
    setIsAuthenticated(true)
    setEmail(data.user?.email ?? "")
    setMustChangePassword(mustChange)
    return { ok: true, mustChangePassword: mustChange }
  }, [])

  const logout = useCallback(() => {
    void supabaseBrowser().auth.signOut().catch(() => {})
    setIsAuthenticated(false)
    setEmail("")
    setMustChangePassword(false)
  }, [])

  // Replace the signed-in user's password and clear the must-change flag in the
  // same update. On success Supabase fires USER_UPDATED → applyUser re-syncs.
  const changePassword = useCallback(async (newPassword: string) => {
    const supabase = supabaseBrowser()
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { must_change_password: false },
    })
    if (error) throw error
    setMustChangePassword(false)
  }, [])

  // --- Jobs ---
  const addJob = useCallback(
    async (jobData: Omit<Job, "id" | "createdAt" | "updatedAt">) => {
      const created = await api.jobs.create({
        title: jobData.title,
        description: jobData.description,
        location: jobData.location,
        type: jobData.type,
        department: jobData.department,
        salary: jobData.salary,
      })
      setJobs((prev) => [reviveJob(created), ...prev])
    },
    []
  )

  const updateJob = useCallback(
    async (id: string, jobData: Omit<Job, "id" | "createdAt">) => {
      const updated = await api.jobs.update(id, {
        title: jobData.title,
        description: jobData.description,
        location: jobData.location,
        type: jobData.type,
        department: jobData.department,
        salary: jobData.salary,
      })
      setJobs((prev) => prev.map((j) => (j.id === id ? reviveJob(updated) : j)))
    },
    []
  )

  const deleteJob = useCallback(async (id: string) => {
    await api.jobs.remove(id)
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }, [])

  const getJob = useCallback(
    (id: string) => jobs.find((job) => job.id === id),
    [jobs]
  )

  // --- Réalisations ---
  const pinnedCount = realisations.filter((r) => r.pinned).length

  const addRealisation = useCallback(
    async (data: Omit<Realisation, "id" | "createdAt" | "updatedAt">) => {
      const created = await api.realisations.create({
        name: data.name,
        images: data.images,
        pinned: data.pinned,
      })
      // New réalisations go to the end (matches the backend's position order).
      setRealisations((prev) => [...prev, reviveRealisation(created)])
    },
    []
  )

  const updateRealisation = useCallback(
    async (
      id: string,
      data: Omit<Realisation, "id" | "createdAt" | "updatedAt">
    ) => {
      const updated = await api.realisations.update(id, {
        name: data.name,
        images: data.images,
        pinned: data.pinned,
      })
      setRealisations((prev) =>
        prev.map((r) => (r.id === id ? reviveRealisation(updated) : r))
      )
    },
    []
  )

  const deleteRealisation = useCallback(async (id: string) => {
    await api.realisations.remove(id)
    setRealisations((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const getRealisation = useCallback(
    (id: string) => realisations.find((r) => r.id === id),
    [realisations]
  )

  const togglePinned = useCallback(async (id: string) => {
    try {
      const updated = await api.realisations.togglePin(id)
      setRealisations((prev) =>
        prev.map((r) => (r.id === id ? reviveRealisation(updated) : r))
      )
      return true
    } catch (e) {
      // 409 → pin limit reached (caller shows the limit alert).
      if (e instanceof ApiError && e.status === 409) return false
      // Any other failure (auth/network/500) is a real error — surface it.
      throw e
    }
  }, [])

  const reorderRealisations = useCallback(
    async (orderedIds: string[]) => {
      const previous = realisations
      const byId = new Map(previous.map((r) => [r.id, r]))
      const next = orderedIds
        .map((id) => byId.get(id))
        .filter((r): r is Realisation => r !== undefined)
      // Bail if the ids don't line up with our list or the order is unchanged.
      if (
        next.length !== previous.length ||
        next.every((r, i) => r.id === previous[i].id)
      ) {
        return
      }
      setRealisations(next) // optimistic
      try {
        await api.realisations.reorder(orderedIds)
      } catch (e) {
        console.error("Réordonnancement échoué:", e)
        setRealisations(previous) // revert
      }
    },
    [realisations]
  )

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        authLoading,
        email,
        jobs,
        login,
        logout,
        mustChangePassword,
        changePassword,
        addJob,
        updateJob,
        deleteJob,
        getJob,
        realisations,
        pinnedCount,
        maxPinned: MAX_PINNED_REALISATIONS,
        addRealisation,
        updateRealisation,
        deleteRealisation,
        getRealisation,
        togglePinned,
        reorderRealisations,
        refreshRealisations: loadRealisations,
        previewEdit,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider")
  }
  return context
}
