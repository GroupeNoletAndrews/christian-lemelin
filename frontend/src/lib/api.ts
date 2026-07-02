// Typed client for the same-origin Next.js API (route handlers under /api).
// The API is now same-origin, so requests are relative and the admin session
// rides in an httpOnly cookie (no Bearer token, no NEXT_PUBLIC_API_URL).

import type { SlotStyle, SlotCaps } from "@/lib/section-style"

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
  inCollection: boolean
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
  inCollection?: boolean
}

/** One editable image slot of a static section (admin view). */
export interface SectionSlotState {
  id: string
  label: string
  aspect: string
  /** Baked-in grayscale design default (the filter toggle starts here). */
  grayscaleDefault: boolean
  publishedKey: string | null
  url: string
  /** Published presentation (focal/zoom/grayscale/border), or null. */
  style: SlotStyle | null
}

export interface SectionAdminState {
  section: string
  label: string
  previewPath: string
  /** Which per-image controls are allowed for this section. */
  caps: SlotCaps
  slots: SectionSlotState[]
}

/** A staged slot change sent to publish: new image key and/or presentation. */
export interface SectionSlotChange {
  slot: string
  key?: string
  style?: SlotStyle | null
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

export const api = {
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
    // `preview` requests the draft-merged list (admin only, server-gated) — used
    // by the content workspace iframe to preview pending edits on the real page.
    list: (preview?: string) =>
      request<ApiRealisation[]>(
        preview ? `/realisations?preview=${encodeURIComponent(preview)}` : "/realisations",
      ),
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
    uploadUrl: (projectName: string, index: number, filename: string) =>
      request<SignedUpload>("/realisations/upload-url", {
        method: "POST",
        body: JSON.stringify({ projectName, index, filename }),
      }),
  },
  // Admin content workspace — per-slot published image overrides for the public
  // sections (staged client-side, published here). Réalisations are edited via
  // the api.realisations.* methods above; static sections use api.sections.static.
  sections: {
    // Static sections (savoir-faire, à-propos, …) — per-slot published overrides.
    static: {
      get: (section: string) =>
        request<SectionAdminState>(`/admin/sections/${section}`),
      publish: (section: string, changes: SectionSlotChange[]) =>
        request<{ ok: true }>(`/admin/sections/${section}/publish`, {
          method: "POST",
          body: JSON.stringify({ changes }),
        }),
    },
  },
  // Admin site settings — small key/value config (layout choices).
  settings: {
    get: () => request<Record<string, string>>("/admin/settings"),
    set: (entries: Record<string, string>) =>
      request<{ ok: true }>("/admin/settings", {
        method: "POST",
        body: JSON.stringify(entries),
      }),
  },
  // Admin media — signed upload to an exact storage key (overwrite in place).
  media: {
    uploadUrlForKey: (key: string) =>
      request<SignedUpload>("/admin/media/upload-url", {
        method: "POST",
        body: JSON.stringify({ key }),
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
