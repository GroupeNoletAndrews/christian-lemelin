"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react"
import { Job, Realisation, MAX_PINNED_REALISATIONS } from "@/types/admin"

interface AdminContextType {
  isAuthenticated: boolean
  username: string
  jobs: Job[]
  login: (username: string, password: string) => boolean
  logout: () => void
  addJob: (job: Omit<Job, "id" | "createdAt" | "updatedAt">) => void
  updateJob: (id: string, job: Omit<Job, "id" | "createdAt">) => void
  deleteJob: (id: string) => void
  getJob: (id: string) => Job | undefined
  // Réalisations
  realisations: Realisation[]
  pinnedCount: number
  maxPinned: number
  addRealisation: (
    data: Omit<Realisation, "id" | "createdAt" | "updatedAt">
  ) => void
  updateRealisation: (
    id: string,
    data: Omit<Realisation, "id" | "createdAt" | "updatedAt">
  ) => void
  deleteRealisation: (id: string) => void
  getRealisation: (id: string) => Realisation | undefined
  /** Toggle pinned state. Returns false if it would exceed the pin limit. */
  togglePinned: (id: string) => boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const REALISATIONS_STORAGE_KEY = "ecl_realisations_v2"

// Dummy data for initial jobs
const DUMMY_JOBS: Job[] = [
  {
    id: "1",
    title: "Ingénieur Fabrication Métallique",
    description:
      "Nous cherchons un ingénieur expérimenté en fabrication métallique pour rejoindre notre équipe. Responsable du design et de l'optimisation des processus de production.",
    location: "Québec, QC",
    type: "full-time",
    department: "Ingénierie",
    salary: "65 000 - 85 000 $/an",
    createdAt: new Date("2025-12-01"),
    updatedAt: new Date("2025-12-01"),
  },
  {
    id: "2",
    title: "Soudeur Qualifié",
    description:
      "Recherchons soudeur TIG/MIG avec au moins 5 ans d'expérience. Travail sur inox, acier et aluminium.",
    location: "Québec, QC",
    type: "full-time",
    department: "Production",
    salary: "55 000 - 70 000 $/an",
    createdAt: new Date("2025-11-15"),
    updatedAt: new Date("2025-11-15"),
  },
]

// Seed réalisations (picsum placeholders, multiple images each so the
// hover carousel is demonstrable out of the box).
const seedImages = (seed: string, n: number) =>
  Array.from(
    { length: n },
    (_, i) => `https://picsum.photos/seed/${seed}-${i + 1}/1200/900`
  )

const DUMMY_REALISATIONS: Realisation[] = [
  // --- 6 pinned (shown on the home page) ---
  {
    id: "r1",
    name: "Cuisine centrale CHU de Québec",
    category: "Restauration",
    images: seedImages("ecl-real-hospital-kitchen", 3),
    pinned: true,
    createdAt: new Date("2025-10-01"),
    updatedAt: new Date("2025-10-01"),
  },
  {
    id: "r2",
    name: "Façade laiton — Place Ste-Foy",
    category: "Architecture",
    images: seedImages("ecl-real-brass-facade", 3),
    pinned: true,
    createdAt: new Date("2025-09-12"),
    updatedAt: new Date("2025-09-12"),
  },
  {
    id: "r3",
    name: "Comptoir bar — Hôtel Le Château",
    category: "Hôtellerie",
    images: seedImages("ecl-real-hotel-bar", 4),
    pinned: true,
    createdAt: new Date("2025-08-20"),
    updatedAt: new Date("2025-08-20"),
  },
  {
    id: "r4",
    name: "Balustrades acier — Villa privée",
    category: "Résidentiel",
    images: seedImages("ecl-real-steel-railing", 3),
    pinned: true,
    createdAt: new Date("2025-07-30"),
    updatedAt: new Date("2025-07-30"),
  },
  {
    id: "r5",
    name: "Structure industrielle — Aluminerie",
    category: "Industrie",
    images: seedImages("ecl-real-industrial-structure", 3),
    pinned: true,
    createdAt: new Date("2025-07-05"),
    updatedAt: new Date("2025-07-05"),
  },
  {
    id: "r6",
    name: "Plafond cuivre — Boutique design",
    category: "Commercial",
    images: seedImages("ecl-real-copper-ceiling", 4),
    pinned: true,
    createdAt: new Date("2025-06-18"),
    updatedAt: new Date("2025-06-18"),
  },
  // --- additional réalisations (not pinned — visible on /realisations) ---
  {
    id: "r7",
    name: "Escalier hélicoïdal inox — Siège social",
    category: "Architecture",
    images: seedImages("ecl-real-spiral-staircase", 3),
    pinned: false,
    createdAt: new Date("2025-05-22"),
    updatedAt: new Date("2025-05-22"),
  },
  {
    id: "r8",
    name: "Mobilier sur mesure — Restaurant Le Clan",
    category: "Restauration",
    images: seedImages("ecl-real-custom-furniture", 3),
    pinned: false,
    createdAt: new Date("2025-04-15"),
    updatedAt: new Date("2025-04-15"),
  },
  {
    id: "r9",
    name: "Garde-corps verre et acier — Condos Bassin",
    category: "Résidentiel",
    images: seedImages("ecl-real-glass-guardrail", 3),
    pinned: false,
    createdAt: new Date("2025-03-09"),
    updatedAt: new Date("2025-03-09"),
  },
]

function reviveRealisations(raw: string): Realisation[] | null {
  try {
    const parsed = JSON.parse(raw) as Realisation[]
    if (!Array.isArray(parsed)) return null
    return parsed.map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
      images: Array.isArray(r.images) ? r.images : [],
    }))
  } catch {
    return null
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [jobs, setJobs] = useState<Job[]>(DUMMY_JOBS)
  const [realisations, setRealisations] =
    useState<Realisation[]>(DUMMY_REALISATIONS)
  const hydrated = useRef(false)

  // Load persisted réalisations on mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(REALISATIONS_STORAGE_KEY)
      if (stored) {
        const revived = reviveRealisations(stored)
        if (revived) setRealisations(revived)
      }
    } catch {
      // localStorage unavailable — fall back to in-memory seed
    }
    hydrated.current = true
  }, [])

  // Persist réalisations after hydration
  useEffect(() => {
    if (!hydrated.current) return
    try {
      window.localStorage.setItem(
        REALISATIONS_STORAGE_KEY,
        JSON.stringify(realisations)
      )
    } catch {
      // Most likely QuotaExceededError — too many/large images for localStorage
      console.warn(
        "Impossible d'enregistrer les réalisations (quota du navigateur dépassé). " +
          "Réduisez le nombre ou la taille des images."
      )
    }
  }, [realisations])

  const login = (user: string, password: string) => {
    // Frontend only - any credentials work
    if (user && password) {
      setIsAuthenticated(true)
      setUsername(user)
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUsername("")
  }

  const addJob = (jobData: Omit<Job, "id" | "createdAt" | "updatedAt">) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setJobs([...jobs, newJob])
  }

  const updateJob = (id: string, jobData: Omit<Job, "id" | "createdAt">) => {
    setJobs(
      jobs.map((job) =>
        job.id === id
          ? {
              ...jobData,
              id,
              createdAt: job.createdAt,
            }
          : job
      )
    )
  }

  const deleteJob = (id: string) => {
    setJobs(jobs.filter((job) => job.id !== id))
  }

  const getJob = (id: string) => {
    return jobs.find((job) => job.id === id)
  }

  // --- Réalisations ---
  const pinnedCount = realisations.filter((r) => r.pinned).length

  const addRealisation = (
    data: Omit<Realisation, "id" | "createdAt" | "updatedAt">
  ) => {
    const capped =
      data.pinned && pinnedCount >= MAX_PINNED_REALISATIONS
        ? { ...data, pinned: false }
        : data
    const now = new Date()
    setRealisations((prev) => [
      ...prev,
      { ...capped, id: now.getTime().toString(), createdAt: now, updatedAt: now },
    ])
  }

  const updateRealisation = (
    id: string,
    data: Omit<Realisation, "id" | "createdAt" | "updatedAt">
  ) => {
    setRealisations((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...data, id, createdAt: r.createdAt, updatedAt: new Date() }
          : r
      )
    )
  }

  const deleteRealisation = (id: string) => {
    setRealisations((prev) => prev.filter((r) => r.id !== id))
  }

  const getRealisation = (id: string) => realisations.find((r) => r.id === id)

  const togglePinned = (id: string) => {
    const target = realisations.find((r) => r.id === id)
    if (!target) return false
    if (!target.pinned && pinnedCount >= MAX_PINNED_REALISATIONS) {
      return false
    }
    setRealisations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, pinned: !r.pinned, updatedAt: new Date() } : r
      )
    )
    return true
  }

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
