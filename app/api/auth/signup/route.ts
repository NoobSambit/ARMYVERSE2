import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { User } from '@/lib/models/User'
import { connect } from '@/lib/db/mongoose'
import { 
  hashPassword, 
  generateToken, 
  validateUsername, 
  validatePassword,
  isUsernameTaken,
  isEmailTaken
} from '@/lib/auth/jwt'
import { LRUCache } from 'lru-cache'

// Rate limiting: 5 signup attempts per hour per IP
const limiter = new LRUCache({
  max: 500,
  ttl: 60 * 60 * 1000, // 1 hour
})

async function checkRateLimit(identifier: string, limit: number) {
  const tokenCount = (limiter.get(identifier) as number) || 0
  if (tokenCount >= limit) {
    throw new Error('Rate limit exceeded')
  }
  limiter.set(identifier, tokenCount + 1)
}

const signupSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(8).max(128),
  name: z.string().max(100).optional(),
  email: z.string().email().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    try {
      await checkRateLimit(ip, 5) // 5 requests per hour
    } catch {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validate input
    let validatedData
    try {
      validatedData = signupSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        )
      }
      throw error
    }

    const { username, password, name, email } = validatedData

    // Validate username
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      return NextResponse.json(
        { error: usernameValidation.error, field: 'username' },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error, field: 'password' },
        { status: 400 }
      )
    }

    await connect()

    // Check if username is taken
    if (await isUsernameTaken(username)) {
      return NextResponse.json(
        { error: 'Username is already taken', field: 'username' },
        { status: 409 }
      )
    }

    // Check if email is taken (if provided)
    if (email && await isEmailTaken(email)) {
      return NextResponse.json(
        { error: 'Email is already registered', field: 'email' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await User.create({
      username: username.toLowerCase(),
      name: name || username,
      email: email?.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        displayName: name || username,
      }
    })

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
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    
    // Handle duplicate key error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Username or email is already taken' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
