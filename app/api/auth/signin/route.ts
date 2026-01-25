import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { User } from '@/lib/models/User'
import { connect } from '@/lib/db/mongoose'
import { comparePassword, generateToken } from '@/lib/auth/jwt'
import { LRUCache } from 'lru-cache'

// Rate limiting: 10 login attempts per 15 minutes per IP
const limiter = new LRUCache({
  max: 500,
  ttl: 15 * 60 * 1000, // 15 minutes
})

async function checkRateLimit(identifier: string, limit: number) {
  const tokenCount = (limiter.get(identifier) as number) || 0
  if (tokenCount >= limit) {
    throw new Error('Rate limit exceeded')
  }
  limiter.set(identifier, tokenCount + 1)
}

const signinSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    try {
      await checkRateLimit(ip, 10) // 10 requests per 15 minutes
    } catch {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validate input
    let validatedData
    try {
      validatedData = signinSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        )
      }
      throw error
    }

    const { usernameOrEmail, password } = validatedData
    const normalizedUsernameOrEmail = usernameOrEmail.trim()
    if (!normalizedUsernameOrEmail) {
      return NextResponse.json(
        { error: 'Username or email is required', field: 'usernameOrEmail' },
        { status: 400 }
      )
    }

    await connect()

    // Find user by username or email
    const isEmail = normalizedUsernameOrEmail.includes('@')
    const query = isEmail 
      ? { email: normalizedUsernameOrEmail.toLowerCase() }
      : { username: normalizedUsernameOrEmail.toLowerCase() }

    const user = await User.findOne(query)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username/email or password' },
        { status: 401 }
      )
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      return NextResponse.json(
        { 
          error: 'This account uses social login. Please sign in with Google or Twitter.',
          field: 'auth_method'
        },
        { status: 400 }
      )
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username/email or password' },
        { status: 401 }
      )
    }

    // Update last login time
    user.updatedAt = new Date()
    await user.save()

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      authType: 'jwt'
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        name: user.name,
        email: user.email,
        displayName: user.profile?.displayName || user.name || user.username,
        avatarUrl: user.profile?.avatarUrl || user.image,
      }
    })

  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Failed to sign in. Please try again.' },
      { status: 500 }
    )
  }
}
