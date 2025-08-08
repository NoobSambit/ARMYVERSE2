import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, initializeFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Basic runtime validation to surface misconfiguration early (helps avoid cryptic 400s)
const missingKeys: string[] = []
if (!firebaseConfig.apiKey) missingKeys.push('NEXT_PUBLIC_FIREBASE_API_KEY')
if (!firebaseConfig.authDomain) missingKeys.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN')
if (!firebaseConfig.projectId) missingKeys.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID')
if (!firebaseConfig.appId) missingKeys.push('NEXT_PUBLIC_FIREBASE_APP_ID')

if (missingKeys.length > 0) {
  // Throwing here prevents the SDK from initializing with undefined values
  throw new Error(
    `Missing Firebase env variables: ${missingKeys.join(', ')}. ` +
    'Check your .env.local matches your Firebase project settings.'
  )
}

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase Authentication
export const auth = getAuth(app)

// Initialize Firestore
// Auto-detect long polling on client to mitigate WebChannel/Listen 400s behind some proxies/CDNs
export const db = (typeof window !== 'undefined')
  ? initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
  : getFirestore(app)

// Initialize Storage (optional, available for uploads if needed)
export const storage = getStorage(app)

export default app