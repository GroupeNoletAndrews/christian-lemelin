// Typed client for the same-origin Next.js API (route handlers under /api).
// The API is now same-origin, so requests are relative and the admin session
// rides in an httpOnly cookie (no Bearer token, no NEXT_PUBLIC_API_URL).

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
  if (options.body != null && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
    // Send/receive the httpOnly admin cookie (same-origin).
    credentials: "include",
  })

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

export interface ApplicationInput {
  name: string
  email: string
  phone?: string
  message?: string
  jobId?: string
  cvKey?: string
  cvFilename?: string
}

interface SignedUpload {
  bucket: string
  path: string
  token: string
}
interface ImageUpload extends SignedUpload {
  publicUrl: string
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<{ username: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    logout: () => request<{ ok: true }>("/auth/logout", { method: "POST" }),
    session: () => request<{ username: string }>("/auth/session"),
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
    remove: (id: string) => request<void>(`/jobs/${id}`, { method: "DELETE" }),
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
    uploadUrl: (filename: string) =>
      request<ImageUpload>("/realisations/upload-url", {
        method: "POST",
        body: JSON.stringify({ filename }),
      }),
  },
  applications: {
    create: (data: ApplicationInput) =>
      request<{ id: string }>("/applications", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    uploadUrl: (filename: string) =>
      request<SignedUpload>("/applications/upload-url", {
        method: "POST",
        body: JSON.stringify({ filename }),
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
