import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  TwitterAuthProvider,
  updateProfile,
  type User,
  type UserCredential,
} from 'firebase/auth'
import { auth } from './config'

// JWT Auth Types
export interface JWTAuthResponse {
  success: boolean
  token: string
  user: {
    id: string
    username: string
    name?: string
    email?: string
    displayName?: string
    avatarUrl?: string
  }
}

export interface JWTUser {
  uid: string
  username: string
  displayName?: string
  email?: string
  photoURL?: string
  authType: 'jwt'
}

// Initialize providers
const googleProvider = new GoogleAuthProvider()
const twitterProvider = new TwitterAuthProvider()

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

const notifyAuthChanged = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('auth-changed'))
}

export interface AuthError {
  code: string
  message: string
}

export interface SignUpData {
  name: string
  email: string
  password: string
}

export interface SignInData {
  email: string
  password: string
}

// Sign up with email and password
export const signUpWithEmail = async ({ name, email, password }: SignUpData): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update the user's display name
    await updateProfile(userCredential.user, {
      displayName: name
    })
    
    return userCredential
  } catch (error: any) {
    throw {
      code: error.code,
      message: getAuthErrorMessage(error.code)
    } as AuthError
  }
}

// Sign in with email and password
export const signInWithEmail = async ({ email, password }: SignInData): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password)
  } catch (error: any) {
    throw {
      code: error.code,
      message: getAuthErrorMessage(error.code)
    } as AuthError
  }
}

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    return await signInWithPopup(auth, googleProvider)
  } catch (error: any) {
    throw {
      code: error.code,
      message: getAuthErrorMessage(error.code)
    } as AuthError
  }
}

// Sign in with Twitter
export const signInWithTwitter = async (): Promise<UserCredential> => {
  try {
    return await signInWithPopup(auth, twitterProvider)
  } catch (error: any) {
    throw {
      code: error.code,
      message: getAuthErrorMessage(error.code)
    } as AuthError
  }
}

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth)
  } catch (error: any) {
    throw {
      code: error.code,
      message: getAuthErrorMessage(error.code)
    } as AuthError
  }
}

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

// ===== Username-based Authentication =====

export interface UsernameSignUpData {
  username: string
  password: string
  name?: string
  email?: string
}

export interface UsernameSignInData {
  usernameOrEmail: string
  password: string
}

/**
 * Sign up with username and password (email optional)
 */
export const signUpWithUsername = async (data: UsernameSignUpData): Promise<JWTAuthResponse> => {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw {
        code: `auth/${result.field || 'error'}`,
        message: result.error || 'Failed to create account'
      } as AuthError
    }

    // Store token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', result.token)
      localStorage.setItem('auth_type', 'jwt')
      notifyAuthChanged()
    }

    return result
  } catch (error: any) {
    if (error.code) {
      throw error
    }
    throw {
      code: 'auth/network-error',
      message: 'Network error. Please check your connection and try again.'
    } as AuthError
  }
}

/**
 * Sign in with username/email and password
 */
export const signInWithUsername = async (data: UsernameSignInData): Promise<JWTAuthResponse> => {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw {
        code: `auth/${result.field || 'error'}`,
        message: result.error || 'Failed to sign in'
      } as AuthError
    }

    // Store token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', result.token)
      localStorage.setItem('auth_type', 'jwt')
      notifyAuthChanged()
    }

    return result
  } catch (error: any) {
    if (error.code) {
      throw error
    }
    throw {
      code: 'auth/network-error',
      message: 'Network error. Please check your connection and try again.'
    } as AuthError
  }
}

/**
 * Get stored JWT token
 */
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

/**
 * Get stored auth type
 */
export const getStoredAuthType = (): 'jwt' | 'firebase' | null => {
  if (typeof window === 'undefined') return null
  const type = localStorage.getItem('auth_type')
  return type === 'jwt' ? 'jwt' : type === 'firebase' ? 'firebase' : null
}

/**
 * Clear stored authentication
 */
export const clearStoredAuth = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_type')
  notifyAuthChanged()
}

/**
 * Get current JWT user from token
 */
export const getCurrentJWTUser = async (): Promise<JWTUser | null> => {
  const token = getStoredToken()
  const authType = getStoredAuthType()
  
  if (!token || authType !== 'jwt') {
    return null
  }

  try {
    // Verify token and get user data
    const response = await fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      clearStoredAuth()
      return null
    }

    const data = await response.json()
    return {
      uid: data.profile.uid || data.profile._id,
      username: data.profile.username || data.profile.handle,
      displayName: data.profile.displayName,
      email: data.profile.email,
      photoURL: data.profile.avatarUrl,
      authType: 'jwt'
    }
  } catch (error) {
    console.error('Failed to get JWT user:', error)
    clearStoredAuth()
    return null
  }
}

// Helper function to convert Firebase auth error codes to user-friendly messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.'
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups and try again.'
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.'
    default:
      return 'An error occurred during authentication. Please try again.'
  }
}
