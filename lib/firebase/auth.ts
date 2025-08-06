import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  TwitterAuthProvider,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth'
import { auth } from './config'

// Initialize providers
const googleProvider = new GoogleAuthProvider()
const twitterProvider = new TwitterAuthProvider()

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

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