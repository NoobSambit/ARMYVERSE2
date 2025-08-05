import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL('/stats?error=spotify_auth_failed', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/stats?error=no_code', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
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
      console.error('Token exchange failed:', await tokenResponse.text())
      return NextResponse.redirect(new URL('/stats?error=token_exchange_failed', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
    }

    const tokenData = await tokenResponse.json()
    
    // Store token in session or pass it to frontend
    // For now, we'll redirect with success and let the frontend handle the session
    return NextResponse.redirect(new URL('/stats?auth=success&token=' + encodeURIComponent(JSON.stringify(tokenData)), process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
  } catch (error) {
    console.error('Spotify callback error:', error)
    return NextResponse.redirect(new URL('/stats?error=callback_failed', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
  }
}
