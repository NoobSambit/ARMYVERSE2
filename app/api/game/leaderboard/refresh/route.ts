import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'
import { LeaderboardEntry } from '@/lib/models/LeaderboardEntry'
import { getPeriodKeys, calculateLevel, type PeriodType } from '@/lib/game/leaderboard'

export const runtime = 'nodejs'

/**
 * POST /api/game/leaderboard/refresh?period=daily|weekly|alltime
 *
 * Force update current user's leaderboard entry with profile data for the specified period.
 * Creates entries if they don't exist (useful for alltime initialization).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connect()

    const { searchParams } = new URL(request.url)
    const periodParam = searchParams.get('period') as PeriodType | null
    const period: PeriodType = periodParam === 'daily' || periodParam === 'weekly' || periodParam === 'alltime' ? periodParam : 'weekly'

    const { periodKey, periodStart, periodEnd } = getPeriodKeys(period)

    // Get user profile data from MongoDB
    const userDoc = await getUserFromAuth(user)
    const profileDisplayName = (userDoc as any)?.profile?.displayName || user.displayName || user.username || 'User'
    const profileAvatarUrl = (userDoc as any)?.profile?.avatarUrl || user.photoURL || ''

    // Get user's total XP and level for all periods
    const { UserGameState } = await import('@/lib/models/UserGameState')
    const gameState = await UserGameState.findOne({ userId: user.uid })
    const totalXp = gameState?.xp || 0
    const level = calculateLevel(totalXp)

    console.log('[Leaderboard Refresh] Updating:', {
      userId: user.uid,
      displayName: profileDisplayName,
      avatarUrl: profileAvatarUrl,
      periodKey,
      period,
      hasProfile: !!(userDoc as any)?.profile
    })

    // Build update operation
    const updateOp: any = {
      $set: {
        displayName: profileDisplayName,
        avatarUrl: profileAvatarUrl,
        level,
        updatedAt: new Date()
      },
      $setOnInsert: {
        periodStart,
        periodEnd,
        stats: { quizzesPlayed: 0, questionsCorrect: 0, totalQuestions: 0 }
      }
    }

    if (period === 'alltime') {
      updateOp.$set.score = totalXp
      updateOp.$setOnInsert.score = totalXp
    } else {
      updateOp.$setOnInsert.score = 0
    }

    // Update existing entry or create new one
    const result = await LeaderboardEntry.findOneAndUpdate(
      { periodKey, userId: user.uid },
      updateOp,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return NextResponse.json({
      success: true,
      period,
      periodKey,
      entry: {
        displayName: result.displayName,
        avatarUrl: result.avatarUrl,
        score: result.score || 0,
        level: result.level || 1
      }
    })
  } catch (error) {
    console.error('Leaderboard refresh error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
