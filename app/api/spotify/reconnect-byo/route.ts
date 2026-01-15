import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'
import { connect } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { decryptSecret, encryptSecret } from '@/lib/utils/secrets'

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

/**
 * Reconnect BYO endpoint
 * Re-initiates OAuth flow using stored BYO credentials when token has expired/been revoked
 */
export async function POST(request: NextRequest) {
    try {
        const authUser = await verifyAuth(request)
        if (!authUser?.uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
        if (!redirectUri) {
            return NextResponse.json({ error: 'Redirect URI not configured' }, { status: 500 })
        }

        await connect()

        const user = await getUserFromAuth(authUser)
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get stored BYO credentials
        const byo = user.integrations?.spotifyByo
        if (!byo?.clientIdEnc) {
            return NextResponse.json({
                error: 'No BYO credentials found. Please set up your Spotify app first.'
            }, { status: 400 })
        }

        // Decrypt stored credentials
        let clientId: string
        let clientSecret: string | undefined

        try {
            clientId = decryptSecret(byo.clientIdEnc)
            if (byo.clientSecretEnc) {
                clientSecret = decryptSecret(byo.clientSecretEnc)
            }
        } catch (decryptError) {
            console.error('Failed to decrypt BYO credentials:', decryptError)
            return NextResponse.json({
                error: 'Stored credentials are corrupted. Please re-enter your Spotify app details.'
            }, { status: 400 })
        }

        // Get scopes - use existing or default
        const existingScopes = byo.scopes || []
        const defaultScopes = (process.env.NEXT_PUBLIC_SPOTIFY_SCOPES || '').split(' ').filter(Boolean)
        const scopes = existingScopes.length > 0 ? existingScopes : defaultScopes
        const ensuredScopes = Array.from(new Set([
            ...scopes,
            'playlist-modify-public',
            'playlist-modify-private',
            'user-read-private'
        ]))

        const state = `byo-${crypto.randomBytes(16).toString('hex')}`

        // Validate encryption key
        const encKey = process.env.SPOTIFY_USER_SECRET_KEY || ''
        if (!encKey || encKey.length < 16) {
            return NextResponse.json({ error: 'Server missing SPOTIFY_USER_SECRET_KEY' }, { status: 500 })
        }

        let codeChallenge: string | undefined
        let codeVerifierEnc: string | undefined

        if (!clientSecret) {
            // Using PKCE flow
            const verifier = generateCodeVerifier()
            codeChallenge = generateCodeChallenge(verifier)
            codeVerifierEnc = encryptSecret(verifier)
        }

        // Store pending reconnection state
        await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    'pending.spotifyByo': {
                        state,
                        clientIdEnc: byo.clientIdEnc, // Reuse existing encrypted credentials
                        clientSecretEnc: byo.clientSecretEnc,
                        scopes: ensuredScopes,
                        codeVerifierEnc: codeVerifierEnc,
                        isReconnect: true,
                        createdAt: new Date()
                    }
                }
            }
        )

        // Build OAuth URL
        const params = new URLSearchParams()
        params.set('client_id', clientId)
        params.set('response_type', 'code')
        params.set('redirect_uri', redirectUri)
        params.set('scope', ensuredScopes.join(' '))
        params.set('state', state)
        // Force re-consent to ensure we get a fresh refresh token
        params.set('show_dialog', 'true')

        if (codeChallenge) {
            params.set('code_challenge_method', 'S256')
            params.set('code_challenge', codeChallenge)
        }

        const url = `https://accounts.spotify.com/authorize?${params.toString()}`

        return NextResponse.json({ url })
    } catch (error) {
        console.error('reconnect-byo error:', error)
        const message = error instanceof Error ? error.message : 'Failed to prepare reconnection'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
