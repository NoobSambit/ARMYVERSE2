import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connect } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { decryptSecret, encryptSecret } from '@/lib/utils/secrets'

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const PROFILE_ENDPOINT = 'https://api.spotify.com/v1/me'

const createSignature = (payload: string, secret: string) =>
  crypto.createHmac('sha256', secret).update(payload).digest('base64url')

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    if (error) {
      return NextResponse.redirect(new URL('/stats?error=spotify_auth_failed', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/stats?error=no_code', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
    }

    // Attempt BYO flow if state matches pending.spotifyByo for any user
    await connect()
    let byoUser = null as any
    if (state) {
      byoUser = await User.findOne({ 'pending.spotifyByo.state': state })
    }

    if (byoUser && code) {
      const pending = byoUser.pending?.spotifyByo || {}
      const clientId = pending.clientIdEnc ? decryptSecret(pending.clientIdEnc) : ''
      const clientSecret = pending.clientSecretEnc ? decryptSecret(pending.clientSecretEnc) : ''
      const codeVerifier = pending.codeVerifierEnc ? decryptSecret(pending.codeVerifierEnc) : ''
      const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || ''

      const params = new URLSearchParams()
      params.set('grant_type', 'authorization_code')
      params.set('code', code)
      params.set('redirect_uri', redirectUri)
      if (!clientSecret) {
        params.set('client_id', clientId)
        params.set('code_verifier', codeVerifier)
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' }
      if (clientSecret) {
        headers['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      }

      const tokenResponse = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers,
        body: params
      })

      if (!tokenResponse.ok) {
        console.error('BYO token exchange failed:', await tokenResponse.text())
        return NextResponse.redirect(new URL('/stats?error=token_exchange_failed', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
      }

      const tokenData = await tokenResponse.json() as {
        access_token: string
        token_type: string
        expires_in: number
        refresh_token?: string
        scope?: string
      }

      if (!tokenData.access_token) {
        return NextResponse.redirect(new URL('/stats?error=no_access_token', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
      }

      const profileResponse = await fetch(PROFILE_ENDPOINT, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      })
      if (!profileResponse.ok) {
        console.error('BYO profile fetch failed:', await profileResponse.text())
        return NextResponse.redirect(new URL('/stats?error=profile_fetch_failed', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
      }
      const profile = await profileResponse.json() as { id: string, display_name?: string, images?: Array<{ url: string }> }

      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)
      const scope = tokenData.scope ? tokenData.scope.split(' ') : (pending.scopes || [])

      await User.findByIdAndUpdate(byoUser._id, {
        $set: {
          'integrations.spotifyByo': {
            clientIdEnc: pending.clientIdEnc,
            clientSecretEnc: pending.clientSecretEnc,
            refreshTokenEnc: tokenData.refresh_token ? encryptSecret(tokenData.refresh_token) : byoUser.integrations?.spotifyByo?.refreshTokenEnc,
            ownerId: profile.id,
            scopes: scope,
            tokenType: tokenData.token_type,
            expiresAt,
            displayName: profile.display_name || '',
            avatarUrl: profile.images?.[0]?.url,
            updatedAt: new Date()
          }
        },
        $unset: { 'pending.spotifyByo': '' }
      }, { new: true })

      return NextResponse.redirect(new URL('/stats?auth=success', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
    }

    // Non-BYO: verify signed state and process existing owner app flow
    const stateSecret = process.env.SPOTIFY_STATE_SECRET
    if (!stateSecret || !state) {
      return NextResponse.redirect(new URL('/stats?error=invalid_state', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
    }

    const [encodedPayload, signature] = state.split('.')
    if (!encodedPayload || !signature) {
      return NextResponse.redirect(new URL('/stats?error=invalid_state_format', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
    }

    const expectedSignature = createSignature(encodedPayload, stateSecret)
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return NextResponse.redirect(new URL('/stats?error=state_mismatch', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
    }

    const statePayload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8')) as {
      uid: string
      email?: string
      username?: string
      nonce: string
      ts: number
    }

    const MAX_STATE_AGE_MS = 5 * 60 * 1000
    if (!statePayload?.uid || !statePayload?.ts || Date.now() - statePayload.ts > MAX_STATE_AGE_MS) {
      return NextResponse.redirect(new URL('/stats?error=state_expired', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
    }
    
    // Must have either email or username
    if (!statePayload.email && !statePayload.username) {
      return NextResponse.redirect(new URL('/stats?error=invalid_state', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
    }

    // Exchange code for access token (owner app credentials)
    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
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

    const tokenData = await tokenResponse.json() as {
      access_token: string
      token_type: string
      expires_in: number
      refresh_token?: string
      scope?: string
    }

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL('/stats?error=no_access_token', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
    }

    const profileResponse = await fetch(PROFILE_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    })

    if (!profileResponse.ok) {
      console.error('Failed to fetch Spotify profile:', await profileResponse.text())
      return NextResponse.redirect(new URL('/stats?error=profile_fetch_failed', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
    }

    const profile = await profileResponse.json() as {
      id: string
      display_name?: string
      images?: Array<{ url: string }>
    }

    await connect()

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)
    const scope = tokenData.scope ? tokenData.scope.split(' ') : []

    // Find user by email or username depending on what's in the state
    const query = statePayload.email 
      ? { $or: [{ firebaseUid: statePayload.uid }, { email: statePayload.email }] }
      : { $or: [{ firebaseUid: statePayload.uid }, { username: statePayload.username }] }

    const updateResult = await User.findOneAndUpdate(
      query,
      {
        $set: {
          ...(statePayload.email && { email: statePayload.email }),
          ...(statePayload.username && !statePayload.email && { username: statePayload.username }),
          firebaseUid: statePayload.uid,
          'integrations.spotify': {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenType: tokenData.token_type,
            expiresAt,
            scope,
            spotifyUserId: profile.id,
            firebaseUid: statePayload.uid,
            displayName: profile.display_name || '',
            avatarUrl: profile.images?.[0]?.url,
            updatedAt: new Date()
          }
        }
      },
      {
        new: true,
        upsert: true
      }
    )

    if (!updateResult) {
      return NextResponse.redirect(new URL('/stats?error=user_store_failed', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
    }

    return NextResponse.redirect(new URL('/stats?auth=success', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
  } catch (error) {
    console.error('Spotify callback error:', error)
    return NextResponse.redirect(new URL('/stats?error=callback_failed', process.env.NEXTAUTH_URL || 'https://armyverse.vercel.app'))
  }
}
