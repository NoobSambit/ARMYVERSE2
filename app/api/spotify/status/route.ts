import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseToken } from '@/lib/auth/verify'
import { connect } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'

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

const buildAuthHeader = () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured')
  }

  return 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
}

async function refreshSpotifyToken(firebaseUid: string, integration: SpotifyIntegration) {
  if (!integration.refreshToken) {
    return null
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
      console.error('Spotify token refresh failed:', await response.text())
      return null
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

    return updatedIntegration
  } catch (error) {
    console.error('Error refreshing Spotify token:', error)
    return null
  }
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyFirebaseToken(request)
    if (!authUser?.uid || !authUser.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connect()

    const userDoc = await User.findOne({ email: authUser.email })
    if (!userDoc || !userDoc.integrations?.spotify) {
      return NextResponse.json({ connected: false })
    }

    let integration = userDoc.integrations.spotify as SpotifyIntegration

    if (!integration.accessToken) {
      return NextResponse.json({ connected: false })
    }

    const expiresAt = integration.expiresAt ? new Date(integration.expiresAt) : null
    const needsRefresh =
      !!expiresAt && expiresAt.getTime() - TOKEN_REFRESH_BUFFER_MS <= Date.now()

    if (needsRefresh) {
      const refreshed = await refreshSpotifyToken(authUser.uid, integration)
      if (refreshed) {
        integration = refreshed
      }
    }

    // If after attempted refresh we still do not have a valid access token, treat as disconnected
    if (!integration.accessToken) {
      return NextResponse.json({ connected: false })
    }

    return NextResponse.json({
      connected: true,
      spotifyUserId: integration.spotifyUserId,
      displayName: integration.displayName,
      avatarUrl: integration.avatarUrl,
      scopes: integration.scopes || [],
      accessToken: integration.accessToken,
      expiresAt: integration.expiresAt ? new Date(integration.expiresAt).toISOString() : null,
      lastUpdated: integration.updatedAt ? new Date(integration.updatedAt).toISOString() : null
    })
  } catch (error) {
    console.error('Spotify status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
