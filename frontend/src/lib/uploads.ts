import { api } from "./api"
import { fileToCompressedBlob } from "./image-utils"
import { uploadToBucket } from "./supabase-browser"

/**
 * Compress a réalisation image and upload it straight to Supabase Storage,
 * returning its public URL (stored in realisation.images[]).
 */
export async function uploadRealisationImage(file: File): Promise<string> {
  const blob = await fileToCompressedBlob(file)
  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg"
  const { bucket, path, token, publicUrl } = await api.realisations.uploadUrl(name)
  await uploadToBucket(bucket, path, token, blob)
  return publicUrl
}

/** Upload a list of images, skipping any that fail. */
export async function uploadRealisationImages(files: File[]): Promise<string[]> {
  const results = await Promise.allSettled(files.map(uploadRealisationImage))
  return results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
    .map((r) => r.value)
}

/** Upload a CV to the private bucket; returns the stored key + original filename. */
export async function uploadCv(
  file: File,
): Promise<{ cvKey: string; cvFilename: string }> {
  const { bucket, path, token } = await api.applications.uploadUrl(file.name)
  await uploadToBucket(bucket, path, token, file)
  return { cvKey: path, cvFilename: file.name }
}
