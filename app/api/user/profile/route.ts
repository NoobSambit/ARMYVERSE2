import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/models/User'
import { connect } from '@/lib/db/mongoose'
import { z } from 'zod'
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'

// Validation schemas - Clean and consistent approach
const profileUpdateSchema = z.object({
  displayName: z.string().optional(),
  handle: z.string().optional(),
  pronouns: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  bias: z.array(z.string()).optional(),
  biasWrecker: z.string().optional(),
  favoriteEra: z.string().optional(),
  armySinceYear: z.number().min(2013).max(new Date().getFullYear()).optional(),
  topSong: z.object({
    id: z.string(),
    name: z.string(),
    artist: z.string()
  }).nullable().optional(),
  topAlbum: z.object({
    id: z.string(),
    name: z.string(),
    artist: z.string()
  }).nullable().optional(),
  socials: z.object({
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
    website: z.string().optional(),
    visibility: z.object({
      twitter: z.boolean().optional(),
      instagram: z.boolean().optional(),
      youtube: z.boolean().optional(),
      website: z.boolean().optional()
    }).optional()
  }).optional(),
  location: z.string().max(100).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  personalization: z.object({
    accentColor: z.string().optional(),
    themeIntensity: z.number().min(0).max(100).optional(),
    backgroundStyle: z.enum([
      // New styles
      'purple-nebula',
      'stage-lights',
      'army-constellation',
      'purple-aurora',
      'mesh-gradient',
      'glassmorphism',
      'geometric-grid',
      'holographic',
      // Legacy styles (for migration compatibility)
      'gradient',
      'noise',
      'bts-motif',
      'clean'
    ]).optional(),
    badgeStyle: z.enum(['minimal', 'collectible']).optional()
  }).optional(),
  privacy: z.object({
    visibility: z.enum(['public', 'followers', 'private']).optional(),
    fieldVisibility: z.object({
      bias: z.boolean().optional(),
      era: z.boolean().optional(),
      socials: z.boolean().optional(),
      stats: z.boolean().optional()
    }).partial().optional(),
    explicitContentFilter: z.boolean().optional(),
    allowMentions: z.boolean().optional(),
    allowDMs: z.boolean().optional(),
    blockedUserIds: z.array(z.string()).optional()
  }).optional(),
  notifications: z.object({
    channels: z.object({
      inApp: z.boolean().optional(),
      email: z.boolean().optional()
    }).optional(),
    quietHours: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
      timezone: z.string().optional()
    }).optional(),
    blog: z.object({
      comments: z.boolean().optional(),
      reactions: z.boolean().optional(),
      saves: z.boolean().optional()
    }).optional(),
    playlists: z.object({
      exports: z.boolean().optional(),
      likes: z.boolean().optional()
    }).optional(),
    spotify: z.object({
      weeklyRecap: z.boolean().optional(),
      recommendations: z.boolean().optional()
    }).optional()
  }).optional()
})

// Note: Helper function moved to @/lib/auth/verify for unified auth support

// Note: Firestore→Mongo migration helper was removed to avoid unused code during build.

// GET /api/user/profile
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connect()
    
    // Find or create user based on auth type
    let dbUser = await getUserFromAuth(authUser)
    
    // If user doesn't exist, create them with minimal profile (mainly for Firebase users)
    if (!dbUser && authUser.authType === 'firebase' && authUser.email) {
      dbUser = await User.findOneAndUpdate(
        { email: authUser.email },
        {
          $setOnInsert: {
            username: authUser.username || authUser.email.split('@')[0],
            name: authUser.displayName || authUser.email.split('@')[0] || 'User',
            email: authUser.email,
            firebaseUid: authUser.uid,
            createdAt: new Date(),
            profile: {
              displayName: authUser.displayName || authUser.email.split('@')[0] || 'User',
              avatarUrl: authUser.photoURL || '',
            }
          }
        },
        { 
          upsert: true, 
          new: true,
          projection: { profile: 1, email: 1, name: 1, firebaseUid: 1, username: 1 }
        }
      )
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update Firebase UID if needed (for Firebase users)
    if (authUser.authType === 'firebase' && (!dbUser.firebaseUid || dbUser.firebaseUid !== authUser.uid)) {
      await User.updateOne({ _id: dbUser._id }, { $set: { firebaseUid: authUser.uid } })
      dbUser = await getUserFromAuth(authUser)
    }

    // Extract profile data from Mongoose document
    const savedProfile = dbUser.profile ? dbUser.profile.toObject() : {}
    
    const profile = {
      // Start with auth data as base
      displayName: authUser.displayName || authUser.username || 'User',
      avatarUrl: authUser.photoURL || '',
      email: authUser.email,
      username: dbUser.username || authUser.username,
      uid: authUser.uid,
      _id: dbUser._id.toString(),
      authType: authUser.authType,
      // Override with saved profile data if it exists
      ...savedProfile
    }

    console.log('GET - dbUser.profile (raw):', dbUser.profile)
    console.log('GET - savedProfile (clean):', savedProfile)
    console.log('GET - merged profile:', profile)

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: error instanceof Error ? error.message : 'Unknown error' })
    }, { status: 500 })
  }
}

// Helper function to sanitize and validate request body
function sanitizeRequestBody(body: Record<string, unknown>) {
  const sanitized: Record<string, unknown> = {}
  
  Object.entries(body).forEach(([key, value]) => {
    // Skip null/undefined values
    if (value === null || value === undefined) {
      return
    }
    
    // Handle empty strings - convert to undefined for optional fields
    if (typeof value === 'string' && value.trim() === '') {
      sanitized[key] = undefined
      return
    }
    
    // Handle empty objects
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
      return
    }
    
    // Keep valid values
    sanitized[key] = value as unknown
  })
  
  return sanitized
}

// PUT /api/user/profile
export async function PUT(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check request size (max 1MB)
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }

    const body = await request.json()
    const sanitizedBody = sanitizeRequestBody(body)
    const validatedData = profileUpdateSchema.parse(sanitizedBody)

    await connect()

    // Check handle uniqueness if provided
    if (validatedData.handle) {
      const query = authUser.authType === 'firebase' && authUser.email
        ? { 'profile.handle': validatedData.handle, email: { $ne: authUser.email } }
        : { 'profile.handle': validatedData.handle, username: { $ne: authUser.username } }
        
      const existingUser = await User.findOne(query)
      if (existingUser) {
        return NextResponse.json({ 
          error: 'Handle already taken',
          field: 'handle'
        }, { status: 409 })
      }
    }

    // Find user - use upsert for efficiency
    const updateFields: Record<string, unknown> = {}
    
    // Build update fields dynamically
    Object.keys(validatedData).forEach(key => {
      const value = validatedData[key as keyof typeof validatedData]
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Handle nested objects
          const objValue = value as Record<string, unknown>
          Object.keys(objValue).forEach(nestedKey => {
            updateFields[`profile.${key}.${nestedKey}`] = objValue[nestedKey]
          })
        } else {
          updateFields[`profile.${key}`] = value
        }
      }
    })

    // Check if user exists first
    const existingUser = await getUserFromAuth(authUser)
    
    let dbUser
    if (existingUser) {
      // Update existing user
      const updateQuery = authUser.authType === 'firebase' && authUser.email
        ? { email: authUser.email }
        : { username: authUser.username }
        
      dbUser = await User.findOneAndUpdate(
        updateQuery,
        {
          $set: {
            name: authUser.displayName || authUser.username || 'User',
            ...(authUser.email && { email: authUser.email }),
            ...(authUser.authType === 'firebase' && { firebaseUid: authUser.uid }),
            ...updateFields
          }
        },
        { 
          new: true,
          runValidators: true
        }
      )
    } else if (authUser.authType === 'firebase' && authUser.email) {
      // Create new user for Firebase (JWT users should already exist)
      dbUser = await User.findOneAndUpdate(
        { email: authUser.email },
        {
          $set: {
            username: authUser.username || authUser.email.split('@')[0],
            name: authUser.displayName || authUser.email.split('@')[0] || 'User',
            email: authUser.email,
            firebaseUid: authUser.uid,
            createdAt: new Date(),
            profile: {
              displayName: authUser.displayName || authUser.email.split('@')[0] || 'User',
              avatarUrl: authUser.photoURL || '',
              ...validatedData
            }
          }
        },
        { 
          upsert: true, 
          new: true,
          runValidators: true
        }
      )
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('PUT - saved profile:', dbUser.profile)

    return NextResponse.json({ 
      success: true, 
      profile: dbUser.profile 
    })
  } catch (error) {
    console.error('Profile PUT error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      }, { status: 400 })
    }

    if (error instanceof Error) {
      // Handle specific MongoDB errors
      if (error.message.includes('duplicate key')) {
        return NextResponse.json({ 
          error: 'Handle already taken',
          field: 'handle'
        }, { status: 409 })
      }
      
      if (error.message.includes('validation failed')) {
        return NextResponse.json({ 
          error: 'Invalid data format',
          details: error.message
        }, { status: 400 })
      }
    }

    return NextResponse.json({ 
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: error instanceof Error ? error.message : 'Unknown error' })
    }, { status: 500 })
  }
}
