"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
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

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [jobs, setJobs] = useState<Job[]>([])
  const [realisations, setRealisations] = useState<Realisation[]>([])

  // Hydrate public data + restore the Supabase admin session on mount.
  useEffect(() => {
    let cancelled = false
    api.jobs
      .list()
      .then((rows) => {
        if (!cancelled) setJobs(rows.map(reviveJob))
      })
      .catch((e) => console.warn("Chargement des emplois impossible:", e))
    api.realisations
      .list()
      .then((rows) => {
        if (!cancelled) setRealisations(rows.map(reviveRealisation))
      })
      .catch((e) => console.warn("Chargement des réalisations impossible:", e))

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

  const login = useCallback(async (loginEmail: string, password: string) => {
    const supabase = supabaseBrowser()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    })
    // Invalid credentials → false (caller shows "identifiants invalides").
    if (error) {
      if (error.status === 400 || error.status === 401) return false
      // Network / server / config error — re-throw for a distinct message.
      throw error
    }
    // Authenticated, but enforce the allowlist (defence in depth).
    if (!isAllowedAdmin(data.user)) {
      await supabase.auth.signOut()
      return false
    }
    setIsAuthenticated(true)
    setEmail(data.user?.email ?? "")
    return true
  }, [])

  const logout = useCallback(() => {
    void supabaseBrowser().auth.signOut().catch(() => {})
    setIsAuthenticated(false)
    setEmail("")
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
