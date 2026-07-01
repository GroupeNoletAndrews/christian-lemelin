// Client-side image helpers for the admin réalisations manager.
//
// Images are uploaded to Supabase Storage (public bucket). Before upload each
// picture is downscaled and re-encoded as JPEG to keep files small.

const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.82
// Accept only lightweight web image formats, and cap the raw upload size so a
// huge file can't be selected by mistake (it's re-encoded to JPEG anyway).
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"]
const MAX_BYTES = 12 * 1024 * 1024 // 12 MB before compression

/**
 * Read an image File, downscale it so its longest edge is at most
 * MAX_DIMENSION, and return a compressed JPEG Blob ready to upload. Rejects
 * anything that isn't a PNG/JPEG/WebP or is larger than MAX_BYTES.
 */
export function fileToCompressedBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      reject(new Error("Format non supporté : utilisez un PNG, JPEG ou WebP."))
      return
    }
    if (file.size > MAX_BYTES) {
      reject(new Error("Image trop lourde (max 12 Mo). Réduisez-la puis réessayez."))
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
        canvas.toBlob(
          (blob) =>
            blob ? resolve(blob) : reject(new Error("Encodage JPEG impossible")),
          "image/jpeg",
          JPEG_QUALITY,
        )
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
