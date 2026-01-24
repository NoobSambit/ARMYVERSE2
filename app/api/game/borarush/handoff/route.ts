import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/verify'
import { signBoraRushHandoff } from '@/lib/auth/gameHandoff'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const handoff = signBoraRushHandoff(user)
    return NextResponse.json({
      token: handoff.token,
      expiresAt: handoff.expiresAt.toISOString()
    })
  } catch (error) {
    console.error('BoraRush handoff error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
