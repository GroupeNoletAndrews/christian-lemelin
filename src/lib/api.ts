// Typed client for the NestJS backend. The base URL is baked at build time
// (NEXT_PUBLIC_*), defaulting to the local backend for `npm run dev`.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3001"

// In-memory bearer token. Admin auth is session-scoped (matches the previous
// in-memory behaviour); a hard refresh logs the admin out, as before.
let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const isFormData = options.body instanceof FormData
  if (options.body != null && !isFormData) {
    headers.set("Content-Type", "application/json")
  }
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`)
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.message) message = String(body.message)
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

// ---- API response shapes (dates are ISO strings over the wire) ----

export interface ApiJob {
  id: string
  title: string
  description: string
  location: string
  type: string
  department: string
  salary?: string
  createdAt: string
  updatedAt: string
}

export interface ApiRealisation {
  id: string
  name: string
  images: string[]
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface JobInput {
  title: string
  description: string
  location: string
  type: string
  department: string
  salary?: string
}

export interface RealisationInput {
  name: string
  images: string[]
  pinned: boolean
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<{ token: string; username: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
  },
  jobs: {
    list: () => request<ApiJob[]>("/jobs"),
    create: (data: JobInput) =>
      request<ApiJob>("/jobs", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: JobInput) =>
      request<ApiJob>(`/jobs/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<void>(`/jobs/${id}`, { method: "DELETE" }),
  },
  realisations: {
    list: () => request<ApiRealisation[]>("/realisations"),
    create: (data: RealisationInput) =>
      request<ApiRealisation>("/realisations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: RealisationInput) =>
      request<ApiRealisation>(`/realisations/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    togglePin: (id: string) =>
      request<ApiRealisation>(`/realisations/${id}/pin`, { method: "PATCH" }),
    reorder: (ids: string[]) =>
      request<{ ok: true }>(`/realisations/reorder`, {
        method: "PATCH",
        body: JSON.stringify({ ids }),
      }),
    remove: (id: string) =>
      request<void>(`/realisations/${id}`, { method: "DELETE" }),
  },
  applications: {
    create: (form: FormData) =>
      request<{ id: string }>("/applications", {
        method: "POST",
        body: form,
      }),
  },
  contact: {
    create: (data: {
      name: string
      email: string
      phone?: string
      message: string
    }) =>
      request<{ id: string }>("/contact", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
}
