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

export interface AdminSession {
  isAuthenticated: boolean
  username?: string
}
