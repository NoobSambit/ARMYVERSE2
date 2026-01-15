import { User } from '@/lib/models/User'
import { decryptSecret } from '@/lib/utils/secrets'

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const TOKEN_REFRESH_BUFFER_MS = 60 * 1000

interface TokenValidationResult {
  valid: boolean
  error?: 'token_revoked' | 'refresh_failed' | 'invalid_credentials' | 'missing_credentials' | null
  message?: string
}

interface RefreshTokenResult {
  accessToken: string
  expiresAt: Date
  scopes: string[]
}

/**
 * Validates that a BYO refresh token is still valid with Spotify
 * This does a lightweight check without persisting new tokens
 */
export async function validateByoRefreshToken(userDoc: any): Promise<TokenValidationResult> {
  if (!userDoc?.integrations?.spotifyByo?.refreshTokenEnc) {
    return { valid: false, error: 'missing_credentials', message: 'No refresh token configured' }
  }

  const byo = userDoc.integrations.spotifyByo

  // If we have a non-expired access token, consider it valid
  const now = Date.now()
  const expiresAt = byo.expiresAt ? new Date(byo.expiresAt).getTime() : 0
  if (byo.accessToken && expiresAt > now + TOKEN_REFRESH_BUFFER_MS) {
    return { valid: true }
  }

  // Need to validate by attempting a refresh
  const clientId = decryptOrNull(byo.clientIdEnc)
  const clientSecret = decryptOrNull(byo.clientSecretEnc)
  const refreshToken = decryptOrNull(byo.refreshTokenEnc)

  if (!clientId) {
    return { valid: false, error: 'invalid_credentials', message: 'Client ID is missing or corrupted' }
  }

  if (!refreshToken) {
    return { valid: false, error: 'missing_credentials', message: 'Refresh token is missing or corrupted' }
  }

  const params = new URLSearchParams()
  params.set('grant_type', 'refresh_token')
  params.set('refresh_token', refreshToken)
  if (!clientSecret) {
    params.set('client_id', clientId)
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  if (clientSecret) {
    headers['Authorization'] = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers,
      body: params
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('BYO token validation failed:', response.status, errorText)

      // Parse Spotify error to determine cause
      const isRevoked = response.status === 400 &&
        (errorText.includes('invalid_grant') ||
          errorText.includes('Refresh token revoked') ||
          errorText.includes('Invalid refresh token'))

      const isInvalidClient = response.status === 401 ||
        (response.status === 400 && errorText.includes('invalid_client'))

      if (isRevoked) {
        return {
          valid: false,
          error: 'token_revoked',
          message: 'Your Spotify authorization has been revoked. Please reconnect your account.'
        }
      }

      if (isInvalidClient) {
        return {
          valid: false,
          error: 'invalid_credentials',
          message: 'Your Spotify app credentials are invalid. Please check your Client ID and Secret.'
        }
      }

      return {
        valid: false,
        error: 'refresh_failed',
        message: 'Failed to validate Spotify connection. Please try again or reconnect.'
      }
    }

    // Token is valid - we got a successful response
    return { valid: true }
  } catch (error) {
    console.error('BYO token validation network error:', error)
    return {
      valid: false,
      error: 'refresh_failed',
      message: 'Network error while validating Spotify connection.'
    }
  }
}

export async function getUserExportToken(userDoc: any): Promise<RefreshTokenResult | null> {
  if (!userDoc?.integrations?.spotifyByo?.refreshTokenEnc) {
    return null
  }

  const byo = userDoc.integrations.spotifyByo

  const now = Date.now()
  const expiresAt = byo.expiresAt ? new Date(byo.expiresAt).getTime() : 0
  const needsRefresh = !byo.expiresAt || (expiresAt - TOKEN_REFRESH_BUFFER_MS) <= now

  if (!needsRefresh && byo.accessToken) {
    return {
      accessToken: byo.accessToken,
      expiresAt: new Date(byo.expiresAt),
      scopes: byo.scopes || []
    }
  }

  const clientId = decryptOrNull(byo.clientIdEnc)
  const clientSecret = decryptOrNull(byo.clientSecretEnc)
  const refreshToken = decryptOrNull(byo.refreshTokenEnc)

  if (!clientId || !refreshToken) {
    return null
  }

  const params = new URLSearchParams()
  params.set('grant_type', 'refresh_token')
  params.set('refresh_token', refreshToken)
  if (!clientSecret) {
    params.set('client_id', clientId)
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  if (clientSecret) {
    headers['Authorization'] = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers,
      body: params
    })

    if (!response.ok) {
      const txt = await response.text()
      console.error('BYO token refresh failed:', response.status, txt)
      return null
    }

    const data = await response.json() as {
      access_token: string
      token_type: string
      expires_in: number
      scope?: string
      refresh_token?: string
    }

    const newExpiresAt = new Date(Date.now() + data.expires_in * 1000)
    const newScopes = data.scope ? data.scope.split(' ') : (byo.scopes || [])

    const updated = {
      ...byo,
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresAt: newExpiresAt,
      scopes: newScopes,
      // Preserve new refresh token if provided (Spotify rotates them sometimes)
      refreshTokenEnc: data.refresh_token
        ? require('@/lib/utils/secrets').encryptSecret(data.refresh_token)
        : byo.refreshTokenEnc,
      updatedAt: new Date()
    }

    await User.findByIdAndUpdate(userDoc._id, {
      $set: {
        'integrations.spotifyByo': updated
      }
    })

    return {
      accessToken: updated.accessToken,
      expiresAt: updated.expiresAt,
      scopes: updated.scopes || []
    }
  } catch (error) {
    console.error('BYO token refresh error:', error)
    return null
  }
}

function decryptOrNull(enc?: string | null): string | null {
  if (!enc) return null
  try {
    return decryptSecret(enc)
  } catch {
    return null
  }
}
