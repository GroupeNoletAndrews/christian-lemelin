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
import {
  api,
  ApiError,
  ApiJob,
  ApiRealisation,
  setAuthToken,
} from "@/lib/api"

interface AdminContextType {
  isAuthenticated: boolean
  username: string
  jobs: Job[]
  login: (username: string, password: string) => Promise<boolean>
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
  /** Move a réalisation one step earlier ("up") or later ("down") in the order. */
  moveRealisation: (id: string, direction: "up" | "down") => Promise<void>
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
  const [username, setUsername] = useState("")
  const [jobs, setJobs] = useState<Job[]>([])
  const [realisations, setRealisations] = useState<Realisation[]>([])

  // Hydrate public data from the backend on mount.
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
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (user: string, password: string) => {
    try {
      const { token, username: name } = await api.auth.login(user, password)
      setAuthToken(token)
      setIsAuthenticated(true)
      setUsername(name)
      return true
    } catch (e) {
      // 401 = wrong username/password → return false (caller shows that).
      if (e instanceof ApiError && e.status === 401) return false
      // Anything else (API down, network, CORS, 5xx) is NOT a credential
      // problem — re-throw so the caller can show a distinct message.
      throw e
    }
  }, [])

  const logout = useCallback(() => {
    setAuthToken(null)
    setIsAuthenticated(false)
    setUsername("")
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

  const moveRealisation = useCallback(
    async (id: string, direction: "up" | "down") => {
      const idx = realisations.findIndex((r) => r.id === id)
      if (idx === -1) return
      const swapWith = direction === "up" ? idx - 1 : idx + 1
      if (swapWith < 0 || swapWith >= realisations.length) return

      const previous = realisations
      const next = [...realisations]
      ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
      setRealisations(next) // optimistic
      try {
        await api.realisations.reorder(next.map((r) => r.id))
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
        username,
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
        moveRealisation,
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
