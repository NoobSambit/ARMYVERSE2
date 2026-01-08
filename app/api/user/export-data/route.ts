import { NextResponse } from 'next/server'
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'
import { connect } from '@/lib/db/mongoose'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const sanitizeUser = (user: any) => {
  if (!user) return null
  const plain = typeof user.toObject === 'function' ? user.toObject({ getters: true, virtuals: false }) : user

  delete plain.password
  delete plain.resetPasswordToken
  delete plain.resetPasswordExpires

  if (plain.integrations?.spotify) {
    delete plain.integrations.spotify.accessToken
    delete plain.integrations.spotify.refreshToken
  }

  return plain
}

export async function GET(request: Request) {
  try {
    const authUser = await verifyAuth(request as any)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connect()

    const userDoc = await getUserFromAuth(authUser)
    if (!userDoc) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const sanitized = sanitizeUser(userDoc)
    const body = JSON.stringify({
      exportedAt: new Date().toISOString(),
      user: sanitized
    }, null, 2)

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="armyverse-profile-${Date.now()}.json"`
      }
    })
  } catch (error) {
    console.error('Export data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
