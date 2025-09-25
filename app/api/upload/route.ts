import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Configure Cloudinary (trim to avoid trailing space/quote issues)
cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
})

export async function GET() {
  try {
    const res = await cloudinary.api.ping()
    return NextResponse.json({ status: 'ok', cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(), res })
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error?.message || 'Ping failed', code: error?.http_code }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const envUnsigned = (process.env.CLOUDINARY_UNSIGNED_PRESET || '').trim()
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json({ error: 'CLOUDINARY_CLOUD_NAME missing' }, { status: 500 })
    }
    if (!envUnsigned && (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) {
      console.error('Cloudinary env missing: ', {
        CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
      })
      return NextResponse.json(
        { error: 'Cloudinary configuration missing on server' },
        { status: 500 }
      )
    }
    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadPreset = (formData.get('uploadPreset') as string | null) || undefined
    const unsignedPreset = envUnsigned || uploadPreset || ''
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload to Cloudinary
    const doUpload = (useUnsigned: boolean) => new Promise((resolve, reject) => {
      const options: any = { folder: 'armyverse-blogs', resource_type: 'auto' }
      if (useUnsigned && unsignedPreset) {
        options.upload_preset = unsignedPreset
        options.unsigned = true
      } else {
        options.transformation = [ { quality: 'auto:good' }, { fetch_format: 'auto' } ]
      }
      cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    let result: any
    try {
      result = await doUpload(!!unsignedPreset)
    } catch (err: any) {
      if (!unsignedPreset && err?.http_code === 401) {
        console.warn('Signed upload failed with 401 and no unsigned preset configured.')
      }
      throw err
    }
    
    return NextResponse.json({
      url: (result as any).secure_url,
      publicId: (result as any).public_id
    })
    
  } catch (error: any) {
    // Cloudinary 401 typically means invalid/mismatched cloud name, API key, or secret
    if (error?.http_code === 401) {
      console.error('Cloudinary auth error (401). Check CLOUDINARY_* env values and cloud name. Message:', error?.message)
    } else {
      console.error('Error uploading image:', error?.message || error)
    }
    const message = process.env.NODE_ENV === 'development' && error?.message
      ? `Failed to upload image: ${error.message}`
      : 'Failed to upload image'
    return NextResponse.json({ error: message }, { status: 500 })
  }
} 