import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { verifyFirebaseToken } from '@/lib/auth/verify'
import { connect } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { encryptSecret } from '@/lib/utils/secrets'

export const dynamic = 'force-dynamic'

function base64url(input: Buffer) {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function generateCodeVerifier(): string {
  const bytes = crypto.randomBytes(32)
  return base64url(bytes)
}

function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest()
  return base64url(hash)
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyFirebaseToken(request)
    if (!authUser?.email || !authUser.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null) as {
      clientId?: string
      clientSecret?: string
      scopes?: string[]
    } | null

    if (!body?.clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
    }

    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
    if (!redirectUri) {
      return NextResponse.json({ error: 'Redirect URI not configured' }, { status: 500 })
    }

    const scopes = (body.scopes && body.scopes.length ? body.scopes : (process.env.NEXT_PUBLIC_SPOTIFY_SCOPES || '').split(' ').filter(Boolean))
    const ensuredScopes = Array.from(new Set([ ...scopes, 'playlist-modify-public', 'playlist-modify-private', 'user-read-private' ]))

    const state = `byo-${crypto.randomBytes(16).toString('hex')}`

    // Validate encryption key once (used for storing clientId/clientSecret and optional PKCE verifier)
    const encKey = process.env.SPOTIFY_USER_SECRET_KEY || ''
    if (!encKey || encKey.length < 16) {
      return NextResponse.json({ error: 'Server missing SPOTIFY_USER_SECRET_KEY' }, { status: 500 })
    }

    let codeChallenge: string | undefined
    let codeVerifierEnc: string | undefined

    if (!body.clientSecret) {
      // Using PKCE flow — encrypt the verifier for temporary storage
      const verifier = generateCodeVerifier()
      codeChallenge = generateCodeChallenge(verifier)
      codeVerifierEnc = encryptSecret(verifier)
    }

    await connect()

    await User.findOneAndUpdate(
      { email: authUser.email },
      {
        $set: {
          'pending.spotifyByo': {
            state,
            clientIdEnc: encryptSecret(body.clientId),
            clientSecretEnc: body.clientSecret ? encryptSecret(body.clientSecret) : undefined,
            scopes: ensuredScopes,
            codeVerifierEnc: codeVerifierEnc,
            createdAt: new Date()
          }
        }
      },
      { upsert: true }
    )

    const params = new URLSearchParams()
    params.set('client_id', body.clientId)
    params.set('response_type', 'code')
    params.set('redirect_uri', redirectUri)
    params.set('scope', ensuredScopes.join(' '))
    params.set('state', state)
    if (codeChallenge) {
      params.set('code_challenge_method', 'S256')
      params.set('code_challenge', codeChallenge)
    }

    const url = `https://accounts.spotify.com/authorize?${params.toString()}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('client-credentials error:', error)
    const message = error instanceof Error ? error.message : 'Failed to prepare authorization'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
