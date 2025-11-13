import crypto from 'crypto'

function getKey(): Buffer {
  const raw = process.env.SPOTIFY_USER_SECRET_KEY
  if (!raw || raw.length < 16) {
    throw new Error('SPOTIFY_USER_SECRET_KEY is not configured')
  }
  const hash = crypto.createHash('sha256').update(raw).digest()
  return hash
}

export function encryptSecret(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(Buffer.from(plaintext, 'utf8')), cipher.final()])
  const tag = cipher.getAuthTag()
  const out = `${iv.toString('base64url')}.${enc.toString('base64url')}.${tag.toString('base64url')}`
  return out
}

export function decryptSecret(enc: string): string {
  const key = getKey()
  const parts = enc.split('.')
  if (parts.length !== 3) throw new Error('Invalid secret format')
  const iv = Buffer.from(parts[0], 'base64url')
  const data = Buffer.from(parts[1], 'base64url')
  const tag = Buffer.from(parts[2], 'base64url')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const out = Buffer.concat([decipher.update(data), decipher.final()])
  return out.toString('utf8')
}
