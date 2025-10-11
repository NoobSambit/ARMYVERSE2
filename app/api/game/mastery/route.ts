import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyFirebaseToken } from '@/lib/auth/verify'
import { MasteryProgress } from '@/lib/models/MasteryProgress'
import { levelForXp } from '@/lib/game/mastery'

export const runtime = 'nodejs'

/** GET /api/game/mastery */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()

    const rows = await MasteryProgress.find({ userId: user.uid }).lean()
    const members: any[] = []
    const eras: any[] = []
    for (const r of rows) {
      const level = levelForXp(r.xp || 0)
      const entry = { key: r.key, xp: r.xp || 0, level, xpToNext: Math.max(0, (level + 1) * 100 - (r.xp || 0)) }
      if (r.kind === 'member') members.push(entry)
      else eras.push(entry)
    }
    return NextResponse.json({ members, eras })
  } catch (error) {
    console.error('Mastery GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


