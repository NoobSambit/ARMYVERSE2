import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { QuestDefinition, IQuestDefinition } from '@/lib/models/QuestDefinition'
import { UserQuestProgress } from '@/lib/models/UserQuestProgress'
import { dailyKey, weeklyKey } from '@/lib/game/quests'
import { UserGameState, IUserGameState } from '@/lib/models/UserGameState'
import { rollRarityAndCardV2 } from '@/lib/game/dropTable'
import { InventoryItem } from '@/lib/models/InventoryItem'
import { UserBadge } from '@/lib/models/UserBadge'
import { updateDailyStreakAndAwardBadges, updateWeeklyStreakAndAwardBadges } from '@/lib/game/streakTracking'
import { checkAndAwardDailyCompletionBadge, checkAndAwardWeeklyCompletionBadge } from '@/lib/game/completionBadges'
import { awardBalances } from '@/lib/game/rewards'
import { mapPhotocardSummary } from '@/lib/game/photocardMapper'

export const runtime = 'nodejs'

/**
 * POST /api/game/quests/claim
 * Body: { code: string }
 */
const Schema = z.object({ code: z.string().min(1) })

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()

    const body = await request.json().catch(() => ({}))
    const input = Schema.safeParse(body)
    if (!input.success) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

    const def = await QuestDefinition.findOne({ code: input.data.code }).lean() as IQuestDefinition | null
    if (!def) return NextResponse.json({ error: 'Quest not found' }, { status: 400 })

    const key = def.period === 'daily' ? dailyKey() : weeklyKey()
    const prog = await UserQuestProgress.findOne({ userId: user.uid, code: def.code, periodKey: key })
    if (!prog || (prog.progress || 0) < def.goalValue) return NextResponse.json({ error: 'Not completed' }, { status: 400 })
    if (prog.claimed) return NextResponse.json({ error: 'Already claimed' }, { status: 409 })

    let reward: any = null
    let balances = null
    if (def.reward?.dust || def.reward?.xp) {
      balances = await awardBalances(user.uid, { dust: def.reward?.dust || 0, xp: def.reward?.xp || 0 })
    }

    // Handle badge rewards
    if (def.reward?.badgeId) {
      try {
        await UserBadge.create({
          userId: user.uid,
          badgeId: def.reward.badgeId,
          earnedAt: new Date(),
          metadata: { questCode: def.code }
        })
      } catch (err) {
        // Duplicate badge - ignore
      }
    }

    if (def.reward?.ticket) {
      const roll = await rollRarityAndCardV2({ userId: user.uid })
      if (roll.card) {
        const sourceType = def.goalType.startsWith('stream:') ? 'quest_streaming' : 'quest_quiz'
        await InventoryItem.create({
          userId: user.uid,
          cardId: roll.card._id,
          acquiredAt: new Date(),
          source: { type: sourceType, questCode: def.code }
        })
        reward = {
          ...mapPhotocardSummary(roll.card),
          rarity: roll.rarity
        }
      }
    }

    prog.claimed = true
    prog.completed = true
    await prog.save()

    // Check for completion badges first
    const completionResult = def.period === 'daily'
      ? await checkAndAwardDailyCompletionBadge(user.uid)
      : await checkAndAwardWeeklyCompletionBadge(user.uid)

    const allBadgesAwarded: string[] = []
    let photocardAwarded: any = undefined
    let newDailyStreak = 0
    let newWeeklyStreak = 0

    // If all quests are completed, award completion badge and update streaks
    if (completionResult.allCompleted) {
      if (completionResult.badgeAwarded) {
        allBadgesAwarded.push(completionResult.badgeAwarded)
      }

      // Update streak and award streak badges
      if (def.period === 'daily') {
        const streakResult = await updateDailyStreakAndAwardBadges(user.uid)
        newDailyStreak = streakResult.newStreak
        allBadgesAwarded.push(...streakResult.badgesAwarded)
        if (streakResult.photocardAwarded) {
          photocardAwarded = streakResult.photocardAwarded
        }
      } else {
        const streakResult = await updateWeeklyStreakAndAwardBadges(user.uid)
        newWeeklyStreak = streakResult.newStreak
        allBadgesAwarded.push(...streakResult.badgesAwarded)
        if (streakResult.photocardAwarded) {
          photocardAwarded = streakResult.photocardAwarded
        }
      }
    }

    const state = await UserGameState.findOne({ userId: user.uid }).lean() as IUserGameState | null

    return NextResponse.json({
      reward,
      balances,
      streaks: {
        daily: newDailyStreak || state?.streak?.dailyCount || 0,
        weekly: newWeeklyStreak || state?.streak?.weeklyCount || 0
      },
      badgesAwarded: allBadgesAwarded,
      photocardAwarded,
      allQuestsCompleted: completionResult.allCompleted
    })
  } catch (error) {
    console.error('Quests claim error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
