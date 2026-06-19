// Client-side image helpers for the admin réalisations manager.
//
// There is no backend/image server, so uploaded pictures are stored as
// data URLs in the browser (localStorage). To keep within the ~5MB
// localStorage budget, every uploaded image is downscaled and re-encoded
// as JPEG before it is stored.

const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.82

/**
 * Read an image File, downscale it so its longest edge is at most
 * MAX_DIMENSION, and return a compressed JPEG data URL.
 */
export function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Le fichier n'est pas une image"))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error("Image invalide"))
      img.onload = () => {
        const { width, height } = img
        const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height))
        const w = Math.round(width * scale)
        const h = Math.round(height * scale)

        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas non supporté"))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

/** Compress a list of files, skipping any that fail. */
export async function filesToCompressedDataUrls(files: File[]): Promise<string[]> {
  const results = await Promise.allSettled(files.map(fileToCompressedDataUrl))
  return results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
    .map((r) => r.value)
}
