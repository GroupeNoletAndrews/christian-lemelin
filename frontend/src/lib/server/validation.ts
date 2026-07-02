import { z } from "zod"
import { AppError } from "./http"

// zod object parsing strips unknown keys by default — mirrors the old Nest
// ValidationPipe (whitelist: true, forbidNonWhitelisted: false).

export const JOB_TYPES = ["full-time", "part-time", "contract"] as const

export const JobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  type: z.enum(JOB_TYPES),
  department: z.string().min(1),
  salary: z.string().optional(),
})

export const RealisationSchema = z.object({
  name: z.string().min(1),
  images: z.array(z.string()),
  pinned: z.boolean().optional(),
  inCollection: z.boolean().optional(),
})

export const ReorderSchema = z.object({
  ids: z.array(z.string()).min(1),
})

export const ApplicationSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  message: z.string().optional(),
  jobId: z.string().optional(),
  // Supabase Storage object key + original filename of a CV uploaded direct-to-storage.
  cvKey: z.string().optional(),
  cvFilename: z.string().optional(),
})

export const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  message: z.string().min(1),
})

export const UploadUrlSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().optional(),
})

// Réalisation image upload: the final storage key is named after the project
// + a 1-based picture number (e.g. photos/realisations/<slug>-<index>.<ext>).
export const ImageUploadUrlSchema = z.object({
  projectName: z.string().min(1),
  index: z.number().int().positive(),
  filename: z.string().min(1),
})

// Signed upload to an exact storage key (content editing — overwrite in place).
export const MediaUploadUrlSchema = z.object({
  key: z.string().min(1),
})

// Non-destructive per-slot presentation (focal/zoom/grayscale/border).
const SlotStyleSchema = z.object({
  objectPosition: z.string().max(32).nullish(),
  zoom: z.number().min(0.1).max(8).nullish(),
  grayscale: z.boolean().nullish(),
  borderRadius: z.string().max(32).nullish(),
  border: z.string().max(64).nullish(),
})

// Publish staged static-section overrides: each change sets a new image `key`,
// a `style`, or both (style-only reframes an already-published image).
export const SectionPublishSchema = z.object({
  changes: z.array(
    z.object({
      slot: z.string().min(1),
      key: z.string().min(1).optional(),
      style: SlotStyleSchema.nullish(),
    }),
  ),
})

/** Validate `data` against `schema`, throwing AppError(400) with a readable message. */
export function parseBody<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const first = result.error.issues[0]
    const path = first?.path.join(".")
    throw new AppError(
      400,
      path ? `${path}: ${first.message}` : first?.message ?? "Données invalides",
    )
  }
  return result.data
}
