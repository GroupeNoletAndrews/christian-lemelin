export interface Job {
  id: string
  title: string
  description: string
  location: string
  type: "full-time" | "part-time" | "contract"
  department: string
  salary?: string
  createdAt: Date
  updatedAt: Date
}

export interface Realisation {
  id: string
  name: string
  category?: string
  /** Ordered image data URLs. images[0] is the cover. */
  images: string[]
  /** Pinned réalisations appear on the home page (max 6). */
  pinned: boolean
  createdAt: Date
  updatedAt: Date
}

export const MAX_PINNED_REALISATIONS = 6

export interface AdminSession {
  isAuthenticated: boolean
  username?: string
}
