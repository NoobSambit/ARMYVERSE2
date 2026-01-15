import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'
import { connect } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { getUserExportToken, validateByoRefreshToken } from '@/lib/spotify/userTokens'

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const TOKEN_REFRESH_BUFFER_MS = 60 * 1000 // 1 minute

interface SpotifyIntegration {
  accessToken?: string
  refreshToken?: string
  tokenType?: string
  expiresAt?: Date
  scopes?: string[]
  spotifyUserId?: string
  firebaseUid?: string
  displayName?: string
  avatarUrl?: string
  updatedAt?: Date
}

interface SpotifyByoIntegration {
  accessToken?: string
  refreshTokenEnc?: string
  clientIdEnc?: string
  clientSecretEnc?: string
  tokenType?: string
  expiresAt?: Date
  scopes?: string[]
  ownerId?: string
  displayName?: string
  avatarUrl?: string
  updatedAt?: Date
}

interface TokenHealthStatus {
  connected: boolean
  needsReauth?: boolean
  errorReason?: 'token_expired' | 'token_revoked' | 'refresh_failed' | 'invalid_credentials' | null
  tokenAge?: number // Days since last refresh
}

const buildAuthHeader = () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured')
  }

  return 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
}

async function refreshSpotifyToken(firebaseUid: string, integration: SpotifyIntegration): Promise<{ integration: SpotifyIntegration | null, error?: string }> {
  if (!integration.refreshToken) {
    return { integration: null, error: 'no_refresh_token' }
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: buildAuthHeader()
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: integration.refreshToken
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Spotify token refresh failed:', response.status, errorText)

      // Parse error to determine if token was revoked
      const isRevoked = response.status === 400 &&
        (errorText.includes('invalid_grant') || errorText.includes('Refresh token revoked'))

      return {
        integration: null,
        error: isRevoked ? 'token_revoked' : 'refresh_failed'
      }
    }

    const data = await response.json() as {
      access_token: string
      token_type: string
      expires_in: number
      scope?: string
      refresh_token?: string
    }

    const expiresAt = new Date(Date.now() + data.expires_in * 1000)
    const scopes = data.scope ? data.scope.split(' ') : integration.scopes || []

    const updatedIntegration: SpotifyIntegration = {
      ...integration,
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresAt,
      scopes,
      refreshToken: data.refresh_token || integration.refreshToken,
      updatedAt: new Date()
    }

    await User.findOneAndUpdate(
      { firebaseUid },
      {
        $set: {
          'integrations.spotify': updatedIntegration
        }
      }
    )

    return { integration: updatedIntegration }
  } catch (error) {
    console.error('Error refreshing Spotify token:', error)
    return { integration: null, error: 'refresh_failed' }
  }
}

function calculateTokenAge(updatedAt?: Date): number {
  if (!updatedAt) return -1
  const now = new Date()
  const diff = now.getTime() - new Date(updatedAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24)) // Days
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connect()

    const userDoc = await getUserFromAuth(authUser)
    if (!userDoc) {
      return NextResponse.json({ connected: false })
    }

    // 1) Prefer BYO personal app if configured
    const byo = (userDoc.integrations?.spotifyByo || {}) as SpotifyByoIntegration
    if (byo && byo.refreshTokenEnc) {
      // First validate that the refresh token is still valid
      const validation = await validateByoRefreshToken(userDoc)

      if (!validation.valid) {
        // Token is invalid - return detailed status for UI
        return NextResponse.json({
          connected: false,
          hasByoCredentials: !!(byo.clientIdEnc),
          needsReauth: true,
          errorReason: validation.error || 'refresh_failed',
          displayName: byo.displayName,
          avatarUrl: byo.avatarUrl,
          tokenAge: calculateTokenAge(byo.updatedAt),
          mode: 'byo',
          message: validation.error === 'token_revoked'
            ? 'Your Spotify authorization has been revoked. Please reconnect.'
            : 'Your Spotify token has expired. Please reconnect to restore access.'
        })
      }

      const token = await getUserExportToken(userDoc)
      if (token?.accessToken) {
        return NextResponse.json({
          connected: true,
          spotifyUserId: byo.ownerId,
          displayName: byo.displayName,
          avatarUrl: byo.avatarUrl,
          scopes: token.scopes || byo.scopes || [],
          accessToken: token.accessToken,
          expiresAt: token.expiresAt ? new Date(token.expiresAt).toISOString() : null,
          lastUpdated: byo.updatedAt ? new Date(byo.updatedAt).toISOString() : null,
          tokenAge: calculateTokenAge(byo.updatedAt),
          tokenHealth: 'healthy',
          mode: 'byo'
        })
      } else {
        // Token fetch failed after validation passed - edge case
        return NextResponse.json({
          connected: false,
          hasByoCredentials: !!(byo.clientIdEnc),
          needsReauth: true,
          errorReason: 'refresh_failed',
          displayName: byo.displayName,
          mode: 'byo',
          message: 'Failed to refresh access token. Please reconnect.'
        })
      }
    }

    // 2) Fallback to standard integration tokens
    if (!userDoc.integrations?.spotify) {
      return NextResponse.json({ connected: false })
    }
    let integration = userDoc.integrations.spotify as SpotifyIntegration

    if (!integration.accessToken && !integration.refreshToken) {
      return NextResponse.json({ connected: false })
    }

    const expiresAt = integration.expiresAt ? new Date(integration.expiresAt) : null
    const needsRefresh =
      !!expiresAt && expiresAt.getTime() - TOKEN_REFRESH_BUFFER_MS <= Date.now()

    let refreshError: string | undefined

    if (needsRefresh || !integration.accessToken) {
      const { integration: refreshed, error } = await refreshSpotifyToken(authUser.uid, integration)
      if (refreshed) {
        integration = refreshed
      } else {
        refreshError = error
      }
    }

    // If after attempted refresh we still do not have a valid access token
    if (!integration.accessToken) {
      return NextResponse.json({
        connected: false,
        needsReauth: true,
        errorReason: refreshError || 'refresh_failed',
        displayName: integration.displayName,
        mode: 'standard',
        message: refreshError === 'token_revoked'
          ? 'Your Spotify authorization has been revoked. Please reconnect.'
          : 'Your Spotify session has expired. Please reconnect.'
      })
    }

    return NextResponse.json({
      connected: true,
      spotifyUserId: integration.spotifyUserId,
      displayName: integration.displayName,
      avatarUrl: integration.avatarUrl,
      scopes: integration.scopes || [],
      accessToken: integration.accessToken,
      expiresAt: integration.expiresAt ? new Date(integration.expiresAt).toISOString() : null,
      lastUpdated: integration.updatedAt ? new Date(integration.updatedAt).toISOString() : null,
      tokenAge: calculateTokenAge(integration.updatedAt),
      tokenHealth: 'healthy',
      mode: 'standard'
    })
  } catch (error) {
    console.error('Spotify status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
