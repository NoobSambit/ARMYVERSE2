import jwt from 'jsonwebtoken'
import { User } from '@/lib/models/User'
import bcrypt from 'bcryptjs'

// Ensure JWT_SECRET is set - CRITICAL SECURITY REQUIREMENT
const JWT_SECRET = process.env.JWT_SECRET as string
if (!JWT_SECRET || JWT_SECRET.length === 0) {
  throw new Error('FATAL: JWT_SECRET environment variable must be set')
}
const JWT_EXPIRES_IN = '7d' // Token valid for 7 days

export interface JWTPayload {
  userId: string
  username: string
  email?: string
  authType: 'jwt' | 'firebase'
}

export interface AuthUser {
  uid: string
  username: string
  email?: string
  displayName?: string
  photoURL?: string
  authType: 'jwt' | 'firebase'
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    // Validate the decoded token has required fields
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'username' in decoded && 'authType' in decoded) {
      return decoded as JWTPayload
    }
    return null
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compare a plain password with a hashed password
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Validate username format
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: 'Username is required' }
  }
  
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' }
  }
  
  if (username.length > 30) {
    return { valid: false, error: 'Username must be at most 30 characters long' }
  }
  
  if (!/^[a-z0-9_]+$/.test(username.toLowerCase())) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' }
  }
  
  // Reserved usernames
  const reserved = ['admin', 'root', 'system', 'api', 'auth', 'user', 'users', 'moderator', 'mod']
  if (reserved.includes(username.toLowerCase())) {
    return { valid: false, error: 'This username is reserved' }
  }
  
  return { valid: true }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' }
  }
  
  if (password.length > 72) {
    return { valid: false, error: 'Password must be at most 72 characters' }
  }
  
  // Check for at least one number and one letter
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, error: 'Password must contain at least one letter' }
  }
  
  if (!/(?=.*[0-9])/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }
  
  return { valid: true }
}

/**
 * Check if a username is already taken
 */
export async function isUsernameTaken(username: string): Promise<boolean> {
  const user = await User.findOne({ username: username.toLowerCase() })
  return !!user
}

/**
 * Check if an email is already taken (when provided)
 */
export async function isEmailTaken(email: string): Promise<boolean> {
  const user = await User.findOne({ email: email.toLowerCase() })
  return !!user
}
