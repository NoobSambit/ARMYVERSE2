/**
 * Token utility functions for unified authentication
 */

import { UnifiedUser } from '@/contexts/AuthContext'

/**
 * Get auth token from UnifiedUser (works with both Firebase and JWT)
 * @throws Error if token cannot be retrieved
 */
export async function getAuthToken(user: UnifiedUser | null): Promise<string> {
  if (!user) {
    throw new Error('User not authenticated')
  }

  if (!user.getIdToken) {
    throw new Error('getIdToken not available')
  }

  try {
    return await user.getIdToken()
  } catch (error) {
    console.error('Failed to get auth token:', error)
    throw new Error('Failed to get authentication token')
  }
}

/**
 * Get auth headers for API requests
 */
export async function getAuthHeaders(user: UnifiedUser | null): Promise<HeadersInit> {
  const token = await getAuthToken(user)
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}
