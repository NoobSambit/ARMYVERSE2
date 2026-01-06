import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'
import { LeaderboardEntry, ILeaderboardEntry } from '@/lib/models/LeaderboardEntry'

export const runtime = 'nodejs'

function weeklyKey(date = new Date()) {
  const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `weekly-${tmp.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`
}

/** GET /api/game/leaderboard?cursor=&limit= */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()

    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const cursor = searchParams.get('cursor')
    const periodKey = weeklyKey()

    const query: { periodKey: string; _id?: { $lt: string } } = { periodKey }
    if (cursor) query._id = { $lt: cursor }

    const rows = await LeaderboardEntry.find(query).sort({ score: -1, _id: -1 }).limit(limit).lean() as unknown as ILeaderboardEntry[]
    const nextCursor = rows.length === limit ? String(rows[rows.length - 1]._id) : undefined

    // user rank
    const my = await LeaderboardEntry.findOne({ periodKey, userId: user.uid }).lean() as ILeaderboardEntry | null
    let myRank: number | null = null
    if (my) {
      myRank = await LeaderboardEntry.countDocuments({ periodKey, score: { $gt: my.score } }) + 1
    }

    console.log('[Leaderboard] Current user entry:', my)
    console.log('[Leaderboard] Top 3 entries:', rows.slice(0, 3))

    return NextResponse.json({ 
      periodKey, 
      entries: rows.map(r => ({
        _id: String(r._id),
        userId: r.userId,
        displayName: r.displayName || 'User',
        avatarUrl: r.avatarUrl || '',
        score: r.score
      })), 
      nextCursor, 
      me: my ? { 
        score: my.score, 
        rank: myRank,
        displayName: my.displayName || 'You',
        avatarUrl: my.avatarUrl || ''
      } : null 
    })
  } catch (error) {
    console.error('Leaderboard GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


