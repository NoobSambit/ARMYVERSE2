import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { getUserBadges } from '@/lib/game/streakTracking'

export const runtime = 'nodejs'

/**
 * GET /api/game/badges
 * Get user's earned badges
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connect()

    const badges = await getUserBadges(user.uid)

    return NextResponse.json({ badges })
  } catch (error) {
    console.error('Badges fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
