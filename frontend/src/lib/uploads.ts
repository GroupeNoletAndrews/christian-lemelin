import { api } from "./api"
import { fileToCompressedBlob } from "./image-utils"
import { uploadToBucket } from "./supabase-browser"

/**
 * Compress a réalisation image and upload it straight to Supabase Storage. The
 * object is named after the project + a 1-based picture number; returns the
 * storage key (persisted in realisation.images[] and resolved via mediaUrl()).
 */
export async function uploadRealisationImage(
  file: File,
  projectName: string,
  index: number,
): Promise<string> {
  const blob = await fileToCompressedBlob(file)
  const { bucket, path, token } = await api.realisations.uploadUrl(
    projectName,
    index,
    "image.jpg", // compressed to JPEG above; only the extension is used server-side
  )
  await uploadToBucket(bucket, path, token, blob)
  return path
}

/**
 * Upload a list of images, skipping any that fail. `startIndex` is the highest
 * picture number already used on the réalisation; new pictures get the next
 * numbers (startIndex+1, +2, …) so deleting a photo never causes a number to be
 * reused (which would overwrite a kept one). Results preserve input order.
 */
export async function uploadRealisationImages(
  files: File[],
  projectName: string,
  startIndex = 0,
): Promise<string[]> {
  const results = await Promise.allSettled(
    files.map((file, i) =>
      uploadRealisationImage(file, projectName, startIndex + i + 1),
    ),
  )
  return results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
    .map((r) => r.value)
}

/**
 * Compress + upload an image to an EXACT storage key, overwriting in place so a
 * replacement keeps the same filename. Used by the content workspace on publish.
 */
export async function uploadImageToKey(file: File, key: string): Promise<string> {
  const blob = await fileToCompressedBlob(file)
  const { bucket, path, token } = await api.media.uploadUrlForKey(key)
  await uploadToBucket(bucket, path, token, blob)
  return path
}

/** Upload a CV to the private bucket; returns the stored key + original filename. */
export async function uploadCv(
  file: File,
): Promise<{ cvKey: string; cvFilename: string }> {
  const { bucket, path, token } = await api.applications.uploadUrl(file.name)
  await uploadToBucket(bucket, path, token, file)
  return { cvKey: path, cvFilename: file.name }
}
