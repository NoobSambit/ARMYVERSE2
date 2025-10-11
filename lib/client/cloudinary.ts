export function thumbUrl(publicId: string) {
  // image/upload/f_auto,q_auto,c_fill,w_320,h_448/<publicId>.webp
  return `https://res.cloudinary.com/${(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD || process.env.CLOUDINARY_CLOUD_NAME || '').trim()}/image/upload/f_auto,q_auto,c_fill,w_320,h_448/${publicId}.webp`
}

export function fullUrl(publicId: string) {
  return `https://res.cloudinary.com/${(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD || process.env.CLOUDINARY_CLOUD_NAME || '').trim()}/image/upload/f_auto,q_auto,c_fill,w_1024/${publicId}.webp`
}


