// Client-side image helpers for the admin réalisations manager.
//
// Images are uploaded to Supabase Storage (public bucket). Before upload each
// picture is downscaled and re-encoded as JPEG to keep files small.

// Long-edge cap + JPEG quality for uploaded réalisation photos. Kept high so the
// large cards / featured hero stay crisp (the tiles oversize the image for
// parallax, so a low cap looked soft/"zoomed"). next/image still re-encodes a
// smaller delivery variant per viewport, so the stored file being larger only
// costs Storage space, not page weight.
// 3000 (not 2400) so a photo opened in the full-screen viewer (sizes="100vw")
// is still 1:1 on a 2× display; next/image never upscales past the stored file,
// so the source is a hard ceiling.
const MAX_DIMENSION = 3000
const JPEG_QUALITY = 0.9
// Accept only lightweight web image formats, and cap the raw upload size so a
// huge file can't be selected by mistake (it's re-encoded to JPEG anyway). The
// cap is generous: a user who has to shrink a photo in another tool first
// degrades it before our resampler ever sees it.
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"]
const MAX_BYTES = 40 * 1024 * 1024 // 40 MB before compression

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
      // Derived from the constant so the copy can never drift from the cap.
      reject(
        new Error(
          `Image trop lourde (max ${Math.round(MAX_BYTES / 1024 / 1024)} Mo). Réduisez-la puis réessayez.`,
        ),
      )
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
        // A 2D context defaults to imageSmoothingQuality "low" — a bilinear/box
        // filter that turns a 6000 → 3000 px downscale to mush. This is the
        // cheapest real sharpness win in the whole pipeline.
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
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
