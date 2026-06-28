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
