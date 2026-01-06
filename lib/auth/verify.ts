import { NextRequest } from 'next/server'
import { getAuth, DecodedIdToken } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { verifyToken, type JWTPayload, type AuthUser } from './jwt'
import { User } from '@/lib/models/User'
import { connect } from '@/lib/db/mongoose'

// Initialize Firebase Admin SDK once
if (!getApps().length) {
  try {
    if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error('Missing Firebase Admin SDK environment variables:', {
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      })
      throw new Error('Firebase Admin SDK not configured - missing environment variables')
    }

    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
      })
    })
    console.log('Firebase Admin SDK initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error)
    throw error
  }
}

const auth = getAuth()

export async function verifyFirebaseToken(request: NextRequest): Promise<DecodedIdToken | null> {
  try {
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
      // If Firebase verification fails, try JWT
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
  
  if (authUser.authType === 'firebase' && authUser.email) {
    return await User.findOne({ 
      $or: [
        { firebaseUid: authUser.uid },
        { email: authUser.email }
      ]
    })
  } else {
    return await User.findOne({ username: authUser.username })
  }
}


