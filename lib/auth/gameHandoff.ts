import jwt from 'jsonwebtoken'
import type { AuthUser } from './jwt'

const GAME_HANDOFF_SECRET = process.env.GAME_HANDOFF_SECRET || ''
const HANDOFF_TTL_SECONDS = 60 * 60 * 2

export type BoraRushHandoffPayload = {
  sub: string
  aud: 'borarush'
  iss: 'armyverse'
  username?: string
  displayName?: string
  photoURL?: string
  authType?: string
}

export type BoraRushHandoffToken = {
  token: string
  expiresAt: Date
}

export function signBoraRushHandoff(user: AuthUser): BoraRushHandoffToken {
  if (!GAME_HANDOFF_SECRET) {
    throw new Error('Missing GAME_HANDOFF_SECRET')
  }

  const issuedAt = Math.floor(Date.now() / 1000)
  const expiresAt = new Date((issuedAt + HANDOFF_TTL_SECONDS) * 1000)

  const token = jwt.sign(
    {
      sub: user.uid,
      username: user.username,
      displayName: user.displayName,
      photoURL: user.photoURL,
      authType: user.authType
    },
    GAME_HANDOFF_SECRET,
    {
      expiresIn: HANDOFF_TTL_SECONDS,
      audience: 'borarush',
      issuer: 'armyverse'
    }
  )

  return { token, expiresAt }
}

export function verifyBoraRushHandoff(token: string): BoraRushHandoffPayload | null {
  if (!GAME_HANDOFF_SECRET) return null
  try {
    const payload = jwt.verify(token, GAME_HANDOFF_SECRET, {
      audience: 'borarush',
      issuer: 'armyverse'
    }) as jwt.JwtPayload

    if (!payload?.sub) return null
    return {
      sub: String(payload.sub),
      aud: 'borarush',
      iss: 'armyverse',
      username: typeof payload.username === 'string' ? payload.username : undefined,
      displayName: typeof payload.displayName === 'string' ? payload.displayName : undefined,
      photoURL: typeof payload.photoURL === 'string' ? payload.photoURL : undefined,
      authType: typeof payload.authType === 'string' ? payload.authType : undefined
    }
  } catch (error) {
    console.warn('[BoraRush] Invalid handoff token', error)
    return null
  }
}
