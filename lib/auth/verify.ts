import { NextRequest } from 'next/server'
import { getAuth, DecodedIdToken } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

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


