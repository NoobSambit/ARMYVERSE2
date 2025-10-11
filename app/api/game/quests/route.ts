import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyFirebaseToken } from '@/lib/auth/verify'
import { getUserQuests } from '@/lib/game/quests'

export const runtime = 'nodejs'

/** GET /api/game/quests */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()
    const quests = await getUserQuests(user.uid)
    return NextResponse.json({ quests })
  } catch (error) {
    console.error('Quests GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


