import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { UserGameState, IUserGameState } from '@/lib/models/UserGameState'
import { Badge } from '@/lib/models/Badge'
import { UserBadge } from '@/lib/models/UserBadge'

export const runtime = 'nodejs'

/**
 * Calculate next milestone and days remaining
 */
function getNextMilestone(currentStreak: number): { nextMilestone: number; daysRemaining: number } | null {
  const milestones = [10, 20, 30, 40, 50]
  const nextMilestone = milestones.find(m => m > currentStreak)

  if (!nextMilestone) return null // Already at max (50)

  return {
    nextMilestone,
    daysRemaining: nextMilestone - currentStreak
  }
}

/** GET /api/game/state - returns user game state with streak info and next milestone */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()

    const state = await UserGameState.findOne({ userId: user.uid }).lean() as IUserGameState | null

    const dailyStreak = state?.streak?.dailyCount || 0
    const weeklyStreak = state?.streak?.weeklyCount || 0

    // Calculate next milestones
    const dailyNextMilestone = getNextMilestone(dailyStreak)
    const weeklyNextMilestone = getNextMilestone(weeklyStreak)

    // Get potential rewards (badges at next milestone)
    let potentialDailyBadge = null
    let potentialWeeklyBadge = null

    if (dailyNextMilestone) {
      const milestoneNum = dailyNextMilestone.nextMilestone / 10
      const badge = await Badge.findOne({
        code: `daily_milestone_${milestoneNum}`,
        active: true
      }).lean() as any

      if (badge) {
        potentialDailyBadge = {
          code: badge.code,
          name: badge.name,
          icon: badge.icon,
          rarity: badge.rarity,
          atStreak: dailyNextMilestone.nextMilestone
        }
      }
    }

    if (weeklyNextMilestone) {
      const milestoneNum = weeklyNextMilestone.nextMilestone / 10
      const badge = await Badge.findOne({
        code: `weekly_milestone_${milestoneNum}`,
        active: true
      }).lean() as any

      if (badge) {
        potentialWeeklyBadge = {
          code: badge.code,
          name: badge.name,
          icon: badge.icon,
          rarity: badge.rarity,
          atStreak: weeklyNextMilestone.nextMilestone
        }
      }
    }

    // Get latest 4 badges
    const latestBadges = await UserBadge.find({ userId: user.uid })
      .sort({ earnedAt: -1 })
      .limit(4)
      .populate('badgeId')
      .lean()

    const badgesFormatted = latestBadges.map(ub => ({
      code: (ub.badgeId as any).code,
      name: (ub.badgeId as any).name,
      icon: (ub.badgeId as any).icon,
      rarity: (ub.badgeId as any).rarity,
      earnedAt: ub.earnedAt
    }))

    return NextResponse.json({
      dust: state?.dust || 0,
      totalXp: state?.xp || 0,
      level: state?.level || 1,
      streaks: {
        daily: {
          current: dailyStreak,
          nextMilestone: dailyNextMilestone?.nextMilestone || null,
          daysRemaining: dailyNextMilestone?.daysRemaining || null
        },
        weekly: {
          current: weeklyStreak,
          nextMilestone: weeklyNextMilestone?.nextMilestone || null,
          weeksRemaining: weeklyNextMilestone?.daysRemaining || null
        }
      },
      potentialRewards: {
        dailyMilestoneBadge: potentialDailyBadge,
        weeklyMilestoneBadge: potentialWeeklyBadge,
        dailyPhotocard: dailyNextMilestone ? { type: 'random' } : null,
        weeklyPhotocard: weeklyNextMilestone ? { type: 'random' } : null
      },
      latestBadges: badgesFormatted
    })
  } catch (error) {
    console.error('Game state GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
