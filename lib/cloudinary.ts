import { v2 as cloudinary, ConfigOptions } from 'cloudinary'

let configured = false

export function init() {
  if (configured) return
  cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim()
  } as ConfigOptions)
  configured = true
}

type UrlOpts = {
  quality?: string
  fetch_format?: string
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'scale' | 'thumb'
}

export function url(publicId: string, opts: UrlOpts = {}) {
  init()
  const transformation: any[] = []
  transformation.push({ quality: opts.quality || 'auto:good' })
  transformation.push({ fetch_format: opts.fetch_format || 'auto' })
  if (opts.width || opts.height) {
    transformation.push({ width: opts.width, height: opts.height, crop: opts.crop || 'scale' })
  }
  return cloudinary.url(publicId, { secure: true, transformation })
}

export { cloudinary }


