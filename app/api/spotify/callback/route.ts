import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL('/?error=spotify_auth_failed', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?error=no_code', request.url))
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || ''
      })
    })

    if (!tokenResponse.ok) {
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url))
    }

    const tokenData = await tokenResponse.json()

    // Redirect to dashboard with success
    return NextResponse.redirect(new URL('/stats?auth=success', request.url))
  } catch (error) {
    console.error('Spotify callback error:', error)
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url))
  }
}
