"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { Job } from "@/types/admin"

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
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

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
    salary: "65,000 - 85,000 $/an",
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
    salary: "55,000 - 70,000 $/an",
    createdAt: new Date("2025-11-15"),
    updatedAt: new Date("2025-11-15"),
  },
]

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [jobs, setJobs] = useState<Job[]>(DUMMY_JOBS)

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
