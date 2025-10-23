import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

// Validate Spotify token by checking /me endpoint
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ tokenValid: false, error: 'No token provided' }, { status: 401 })
    }

    // Test the token with Spotify's /me endpoint
    const meResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!meResponse.ok) {
      return NextResponse.json({ 
        tokenValid: false, 
        error: 'Token validation failed',
        status: meResponse.status 
      }, { status: meResponse.status })
    }

    const userData = await meResponse.json()

    return NextResponse.json({
      tokenValid: true,
      userData: {
        id: userData.id,
        display_name: userData.display_name
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      tokenValid: false,
      error: 'Validation request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
