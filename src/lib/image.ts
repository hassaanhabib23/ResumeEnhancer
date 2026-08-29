// Downscales an uploaded image client-side before it's stored as a base64
// data URL — a resume headshot never needs to be full camera resolution
// (often several MB), and since resumes persist to localStorage, storing
// the original file risks quickly hitting the browser's per-origin quota
// once a user has a few resumes with photos.
const MAX_DIMENSION = 480
const JPEG_QUALITY = 0.85
export const MAX_PHOTO_UPLOAD_BYTES = 15 * 1024 * 1024 // sanity cap before we even try decoding

export async function resizeImageToDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Could not read that image.'))
      el.src = objectUrl
    })

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight))
    const width = Math.max(1, Math.round(img.naturalWidth * scale))
    const height = Math.max(1, Math.round(img.naturalHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not process that image.')
    ctx.drawImage(img, 0, 0, width, height)

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
