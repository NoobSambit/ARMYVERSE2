import { NextRequest } from 'next/server'
import { getAuth, DecodedIdToken } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { verifyToken, type AuthUser } from './jwt'
import { User } from '@/lib/models/User'
import { connect } from '@/lib/db/mongoose'

let firebaseAuth: ReturnType<typeof getAuth> | null = null
let firebaseInitAttempted = false

function getFirebaseAuth() {
  if (firebaseAuth || firebaseInitAttempted) {
    return firebaseAuth
  }

  firebaseInitAttempted = true

  const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL
  const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY
  const hasProjectId = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  if (!hasClientEmail || !hasPrivateKey || !hasProjectId) {
    console.warn('Firebase Admin SDK not configured; skipping Firebase token verification.', {
      hasClientEmail,
      hasPrivateKey,
      hasProjectId
    })
    return null
  }

  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
        })
      })
    }
    firebaseAuth = getAuth()
    console.log('Firebase Admin SDK initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error)
    firebaseAuth = null
  }

  return firebaseAuth
}

export async function verifyFirebaseToken(request: NextRequest): Promise<DecodedIdToken | null> {
  try {
    const auth = getFirebaseAuth()
    if (!auth) {
      return null
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await auth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

/**
 * Unified authentication verification that supports both Firebase and JWT tokens
 * Returns a normalized AuthUser object regardless of auth method
 */
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.split('Bearer ')[1]
    
    // Try Firebase token first
    const auth = getFirebaseAuth()
    if (auth) {
      try {
        const firebaseToken = await auth.verifyIdToken(token)
        return {
          uid: firebaseToken.uid,
          username: firebaseToken.email?.split('@')[0] || 'user', // Fallback for Firebase users
          email: firebaseToken.email,
          displayName: firebaseToken.name,
          photoURL: firebaseToken.picture,
          authType: 'firebase'
        }
      } catch (firebaseError) {
        // Fall through to JWT verification
      }
    }

    // If Firebase verification fails or isn't configured, try JWT
    const jwtPayload = verifyToken(token)
    if (!jwtPayload) {
      return null
    }
    
    // Get user details from database for JWT auth
    await connect()
    const user = await User.findById(jwtPayload.userId)
    if (!user) {
      return null
    }
    
    return {
      uid: user._id.toString(),
      username: user.username,
      email: user.email,
      displayName: user.name || user.username,
      photoURL: user.image,
      authType: 'jwt'
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

/**
 * Get user from database by auth information
 * Works with both Firebase and JWT auth
 */
export async function getUserFromAuth(authUser: AuthUser) {
  await connect()
  
  if (authUser.authType === 'firebase') {
    if (authUser.email) {
      return await User.findOne({
        $or: [
          { firebaseUid: authUser.uid },
          { email: authUser.email }
        ]
      })
    }
    return await User.findOne({ firebaseUid: authUser.uid })
  }

  if (authUser.uid) {
    const byId = await User.findById(authUser.uid)
    if (byId) return byId
  }

  return await User.findOne({ username: authUser.username })
}
