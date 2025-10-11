import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyFirebaseToken } from '@/lib/auth/verify'
import { UserGameState } from '@/lib/models/UserGameState'

export const runtime = 'nodejs'

/** GET /api/game/state - returns lightweight user game state (total xp, dust, streak) */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()
    const state = await UserGameState.findOne({ userId: user.uid }).lean()
    return NextResponse.json({
      totalXp: state?.xp || 0,
      dust: state?.dust || 0,
      streak: state?.streak?.dailyCount || 0
    })
  } catch (error) {
    console.error('Game state GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


