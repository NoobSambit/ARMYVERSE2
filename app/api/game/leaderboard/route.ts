import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { LeaderboardEntry, ILeaderboardEntry } from '@/lib/models/LeaderboardEntry'
import { UserGameState } from '@/lib/models/UserGameState'
import { getPeriodKeys, type PeriodType } from '@/lib/game/leaderboard'
import { getLevelProgress } from '@/lib/game/leveling'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Updates ranks for a given period. This should be called periodically via cron job.
 * For now, we'll do lazy rank calculation on demand.
 */
async function updateRanks(periodKey: string): Promise<void> {
  const entries = await LeaderboardEntry.find({ periodKey })
    .sort({ score: -1, lastPlayedAt: -1 })
    .lean()

  const bulkOps = entries.map((entry, index) => ({
    updateOne: {
      filter: { _id: entry._id },
      update: { $set: { rank: index + 1, previousRank: entry.rank || null } }
    }
  }))

  if (bulkOps.length > 0) {
    await LeaderboardEntry.bulkWrite(bulkOps)
  }
}

/**
 * GET /api/game/leaderboard?period=daily|weekly|alltime&cursor=&limit=
 *
 * Fetches leaderboard entries with pagination for the specified period.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connect()

    const { searchParams } = new URL(request.url)
    const periodParam = searchParams.get('period') as PeriodType | null
    const period: PeriodType = periodParam === 'daily' || periodParam === 'weekly' || periodParam === 'alltime' ? periodParam : 'weekly'
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const cursor = searchParams.get('cursor')

    const { periodKey } = getPeriodKeys(period)

    // Lazy rank update - recalculate ranks for this period
    // In production, this should be done via a scheduled job
    await updateRanks(periodKey).catch(() => {
      // Fail silently on rank update, still return results
    })

    const query: { periodKey: string; score?: { $lt?: number }; _id?: { $lt?: string } } = { periodKey }

    if (cursor) {
      try {
        const cursorEntry = await LeaderboardEntry.findById(cursor).lean() as ILeaderboardEntry | null
        if (cursorEntry) {
          query.score = { $lt: cursorEntry.score }
        }
      } catch {
        // Invalid cursor, ignore
      }
    }

    const rows = await LeaderboardEntry.find(query)
      .sort({ score: -1, lastPlayedAt: 1, _id: 1 })
      .limit(limit)
      .lean() as unknown as ILeaderboardEntry[]

    const nextCursor = rows.length === limit ? String(rows[rows.length - 1]._id) : undefined

    // Find current user's entry and rank
    let myEntry = await LeaderboardEntry.findOne({ periodKey, userId: user.uid }).lean() as ILeaderboardEntry | null
    let myRank: number | null = null
    let myRankChange: number | null = null

    // Auto-backfill for all-time: If user has XP but no entry (or entry has score 0),
    // create/fix the entry to ensure accurate leaderboard representation.
    // This handles edge cases like:
    // - Users who played before the $inc fix
    // - Database inconsistencies
    // - Missing entries from failed upserts
    if (period === 'alltime') {
      const gameState = await UserGameState.findOne({ userId: user.uid }).lean() as { xp?: number } | null
      const userTotalXp = gameState?.xp ?? 0

      // Create/fix entry if: (no entry) OR (entry exists but score is 0 while user has XP)
      const needsBackfill = !myEntry || ((myEntry.score || 0) === 0 && userTotalXp > 0)

      if (needsBackfill) {
        // Get user profile for display
        let profileDisplayName = user.displayName || user.username || 'User'
        let profileAvatarUrl = user.photoURL || ''

        try {
          const { getUserFromAuth } = await import('@/lib/auth/verify')
          const userDoc = await getUserFromAuth(user)
          profileDisplayName = (userDoc as any)?.profile?.displayName || profileDisplayName
          profileAvatarUrl = (userDoc as any)?.profile?.avatarUrl || profileAvatarUrl
        } catch {
          // Fall back to Firebase profile data
        }

        const levelProgress = getLevelProgress(userTotalXp)
        const { periodStart, periodEnd } = getPeriodKeys('alltime')

        await LeaderboardEntry.updateOne(
          { periodKey, userId: user.uid },
          {
            $set: {
              score: userTotalXp,
              level: levelProgress.level,
              displayName: profileDisplayName,
              avatarUrl: profileAvatarUrl,
              updatedAt: new Date()
            },
            $setOnInsert: {
              periodStart,
              periodEnd,
              stats: { quizzesPlayed: 0, questionsCorrect: 0, totalQuestions: 0 }
            }
          },
          { upsert: true }
        )

        // Re-fetch the entry after backfill
        myEntry = await LeaderboardEntry.findOne({ periodKey, userId: user.uid }).lean() as ILeaderboardEntry | null
      }
    }

    if (myEntry) {
      if (myEntry.rank) {
        myRank = myEntry.rank
      } else {
        // Fallback rank calculation if not yet computed
        myRank = await LeaderboardEntry.countDocuments({ periodKey, score: { $gt: myEntry.score } }) + 1
      }

      if (myEntry.previousRank && myEntry.previousRank > 0) {
        myRankChange = myEntry.previousRank - myRank
      }
    }

    let levelProgress = null
    let statsForAccuracy = myEntry?.stats || { quizzesPlayed: 0, questionsCorrect: 0, totalQuestions: 0 }
    let alltimeEntry: ILeaderboardEntry | null = null

    // Always fetch user's game state and level progress
    const state = await UserGameState.findOne({ userId: user.uid }).lean() as { xp?: number } | null
    levelProgress = getLevelProgress(state?.xp ?? 0)

    // For daily/weekly periods, if user hasn't played in this period (no stats),
    // fall back to all-time stats for accuracy display
    if (period !== 'alltime') {
      alltimeEntry = await LeaderboardEntry.findOne({
        periodKey: 'alltime',
        userId: user.uid
      }).lean() as ILeaderboardEntry | null

      if (statsForAccuracy.totalQuestions === 0 && alltimeEntry?.stats && alltimeEntry.stats.totalQuestions > 0) {
        statsForAccuracy = alltimeEntry.stats
      }
    }

    // Build the me object - include it even if no period entry but user has all-time data
    let meResponse = null
    if (myEntry) {
      meResponse = {
        score: myEntry.score || 0,
        level: levelProgress?.level || myEntry.level || 1,
        rank: myRank,
        rankChange: myRankChange,
        displayName: myEntry.displayName || 'You',
        avatarUrl: myEntry.avatarUrl || '',
        stats: statsForAccuracy,
        totalXp: levelProgress?.totalXp ?? 0,
        xpIntoLevel: levelProgress?.xpIntoLevel ?? 0,
        xpForNextLevel: levelProgress?.xpForNextLevel ?? 0,
        xpProgress: levelProgress?.progressPercent ?? 0,
        xpToNextLevel: levelProgress?.xpToNextLevel ?? 0
      }
    } else if (period !== 'alltime' && alltimeEntry) {
      // User hasn't played in this period but has all-time data - show their accuracy from all-time
      meResponse = {
        score: 0,
        level: levelProgress?.level || alltimeEntry.level || 1,
        rank: null,
        rankChange: null,
        displayName: alltimeEntry.displayName || 'You',
        avatarUrl: alltimeEntry.avatarUrl || '',
        stats: alltimeEntry.stats || { quizzesPlayed: 0, questionsCorrect: 0, totalQuestions: 0 },
        totalXp: levelProgress?.totalXp ?? 0,
        xpIntoLevel: levelProgress?.xpIntoLevel ?? 0,
        xpForNextLevel: levelProgress?.xpForNextLevel ?? 0,
        xpProgress: levelProgress?.progressPercent ?? 0,
        xpToNextLevel: levelProgress?.xpToNextLevel ?? 0
      }
    }

    return NextResponse.json({
      period,
      periodKey,
      entries: rows.map((r, index) => ({
        _id: String(r._id),
        userId: r.userId,
        displayName: r.displayName || 'User',
        avatarUrl: r.avatarUrl || '',
        score: r.score || 0,
        level: r.level || 1,
        rank: r.rank || (index + 1),
        previousRank: r.previousRank,
        rankChange: r.previousRank ? (r.previousRank - (r.rank || index + 1)) : null,
        stats: r.stats || { quizzesPlayed: 0, questionsCorrect: 0, totalQuestions: 0 }
      })),
      nextCursor,
      me: meResponse
    })
  } catch (error) {
    console.error('Leaderboard GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
