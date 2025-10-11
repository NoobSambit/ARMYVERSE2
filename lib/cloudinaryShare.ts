import { v2 as cloudinary } from 'cloudinary'
import { init } from '@/lib/cloudinary'

type ShareOpts = {
  publicId: string
  text: string
}

export function buildShareUrl({ publicId, text }: ShareOpts) {
  init()
  // Simple text overlay using Cloudinary transformation
  const overlay = {
    overlay: {
      font_family: 'Arial',
      font_size: 48,
      text: text
    },
    color: '#ffffff',
    gravity: 'south',
    y: 40
  } as any
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
      overlay
    ]
  })
}


