import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
    const scopes = process.env.NEXT_PUBLIC_SPOTIFY_SCOPES || 'user-read-private user-read-email'

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: 'Spotify credentials not configured' },
        { status: 500 }
      )
    }

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${Math.random().toString(36).substring(7)}`

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error generating auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}
