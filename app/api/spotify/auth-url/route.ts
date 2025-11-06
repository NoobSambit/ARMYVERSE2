import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { verifyFirebaseToken } from '@/lib/auth/verify'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
    const scopes = process.env.NEXT_PUBLIC_SPOTIFY_SCOPES || 'user-read-private user-read-email'
    const stateSecret = process.env.SPOTIFY_STATE_SECRET

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: 'Spotify credentials not configured' },
        { status: 500 }
      )
    }

    if (!stateSecret) {
      return NextResponse.json(
        { error: 'Spotify state secret not configured' },
        { status: 500 }
      )
    }

    const user = await verifyFirebaseToken(request)
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const nonce = crypto.randomBytes(16).toString('hex')
    const statePayload = {
      uid: user.uid,
      email: user.email,
      nonce,
      ts: Date.now()
    }

    const encodedPayload = Buffer.from(JSON.stringify(statePayload)).toString('base64url')
    const signature = crypto
      .createHmac('sha256', stateSecret)
      .update(encodedPayload)
      .digest('base64url')

    const state = `${encodedPayload}.${signature}`

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`

    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error('Error generating auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}
