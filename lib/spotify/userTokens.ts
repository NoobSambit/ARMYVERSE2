import { User } from '@/lib/models/User'
import { decryptSecret } from '@/lib/utils/secrets'

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const TOKEN_REFRESH_BUFFER_MS = 60 * 1000

export async function getUserExportToken(userDoc: any): Promise<{
  accessToken: string,
  expiresAt: Date,
  scopes: string[]
} | null> {
  if (!userDoc?.integrations?.spotifyByo?.refreshTokenEnc) {
    return null
  }

  const byo = userDoc.integrations.spotifyByo

  const now = Date.now()
  const expiresAt = byo.expiresAt ? new Date(byo.expiresAt).getTime() : 0
  const needsRefresh = !byo.expiresAt || (expiresAt - TOKEN_REFRESH_BUFFER_MS) <= now

  if (!needsRefresh && byo.accessToken) {
    return {
      accessToken: byo.accessToken,
      expiresAt: new Date(byo.expiresAt),
      scopes: byo.scopes || []
    }
  }

  const clientId = decryptOrNull(byo.clientIdEnc)
  const clientSecret = decryptOrNull(byo.clientSecretEnc)
  const refreshToken = decryptOrNull(byo.refreshTokenEnc)

  if (!clientId || !refreshToken) {
    return null
  }

  const params = new URLSearchParams()
  params.set('grant_type', 'refresh_token')
  params.set('refresh_token', refreshToken)
  if (!clientSecret) {
    params.set('client_id', clientId)
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  if (clientSecret) {
    headers['Authorization'] = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers,
    body: params
  })

  if (!response.ok) {
    const txt = await response.text()
    console.error('BYO token refresh failed:', response.status, txt)
    return null
  }

  const data = await response.json() as {
    access_token: string
    token_type: string
    expires_in: number
    scope?: string
  }

  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000)
  const newScopes = data.scope ? data.scope.split(' ') : (byo.scopes || [])

  const updated = {
    ...byo,
    accessToken: data.access_token,
    tokenType: data.token_type,
    expiresAt: newExpiresAt,
    scopes: newScopes,
    updatedAt: new Date()
  }

  await User.findByIdAndUpdate(userDoc._id, {
    $set: {
      'integrations.spotifyByo': updated
    }
  })

  return {
    accessToken: updated.accessToken,
    expiresAt: updated.expiresAt,
    scopes: updated.scopes || []
  }
}

function decryptOrNull(enc?: string | null): string | null {
  if (!enc) return null
  try {
    return decryptSecret(enc)
  } catch {
    return null
  }
}
