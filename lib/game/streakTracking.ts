import { UserGameState } from '@/lib/models/UserGameState'
import { UserBadge } from '@/lib/models/UserBadge'
import { Badge } from '@/lib/models/Badge'
import { InventoryItem } from '@/lib/models/InventoryItem'
import { rollRarityAndCardV2 } from './dropTable'
import { dailyKey, weeklyKey } from './quests'

/**
 * Update daily streak after completing all daily quests
 *
 * Badge System:
 * - Set 1: Daily streak badges 1-10 (awarded for days 1-10 of each cycle)
 * - Set 2: Milestone badges (awarded at 10, 20, 30, 40, 50 total streaks)
 *
 * Flow: User completes streaks 1-10, then it loops back to 1-10 again for new highs.
 * After a streak break, badges resume only when surpassing the previous high.
 * Every completed day awards a photocard; milestones award the milestone badge.
 */
export async function updateDailyStreakAndAwardBadges(userId: string): Promise<{
  newStreak: number
  badgesAwarded: string[]
  photocardAwarded?: any
}> {
  let state = await UserGameState.findOne({ userId })
  if (!state) {
    state = await UserGameState.create({
      userId,
      badges: {
        lastDailyStreakMilestone: 0,
        lastWeeklyStreakMilestone: 0,
        dailyStreakMilestoneCount: 0,
        weeklyStreakMilestoneCount: 0
      }
    })
  }
  if (!state.badges) {
    state.badges = {
      lastDailyStreakMilestone: 0,
      lastWeeklyStreakMilestone: 0,
      dailyStreakMilestoneCount: 0,
      weeklyStreakMilestoneCount: 0
    }
  }
  if (!state.earnedStreaks) {
    state.earnedStreaks = {
      daily: [],
      weekly: [],
      highestDaily: 0,
      highestWeekly: 0
    }
  }
  if (!state.badges) {
    state.badges = {
      lastDailyStreakMilestone: 0,
      lastWeeklyStreakMilestone: 0,
      dailyStreakMilestoneCount: 0,
      weeklyStreakMilestoneCount: 0
    }
  }
  if (!state.earnedStreaks) {
    state.earnedStreaks = {
      daily: [],
      weekly: [],
      highestDaily: 0,
      highestWeekly: 0
    }
  }

  const today = dailyKey()
  const yesterday = dailyKey(new Date(Date.now() - 24 * 60 * 60 * 1000))

  const lastPlayKey = state.streak.lastDailyQuestCompletionAt
    ? dailyKey(state.streak.lastDailyQuestCompletionAt)
    : null

  let totalStreak = state.streak.dailyCount

  if (!lastPlayKey) {
    // First daily quest completion ever
    totalStreak = 1
  } else if (lastPlayKey === today) {
    // Already completed all daily quests today, no change
    return { newStreak: totalStreak, badgesAwarded: [] }
  } else if (lastPlayKey === yesterday) {
    // Consecutive day - increment
    totalStreak++

    // Stop at 50 (max milestone)
    if (totalStreak > 50) {
      totalStreak = 50
    }
  } else {
    // Streak broken - reset to 1
    totalStreak = 1
  }

  // Update state
  state.streak.dailyCount = totalStreak
  state.streak.lastDailyQuestCompletionAt = new Date()

  const badgesAwarded: string[] = []
  const lastMilestone = Math.max(
    state.badges?.lastDailyStreakMilestone || 0,
    state.earnedStreaks?.highestDaily || 0
  )
  let photocardAwarded: any = undefined

  // Award photocard for completing all daily quests (every day).
  const dailyRoll = await rollRarityAndCardV2({ userId })
  if (dailyRoll.card) {
    await InventoryItem.create({
      userId,
      cardId: dailyRoll.card._id,
      acquiredAt: new Date(),
      source: { type: 'daily_completion', totalStreak }
    })
    photocardAwarded = {
      cardId: dailyRoll.card._id.toString(),
      rarity: dailyRoll.rarity,
      category: dailyRoll.card.categoryDisplay,
      subcategory: dailyRoll.card.subcategoryPath || null,
      imageUrl: dailyRoll.card.imageUrl,
      sourceUrl: dailyRoll.card.sourceUrl || dailyRoll.card.pageUrl
    }
  }

  // Calculate which badge in the 1-10 cycle to award
  const cyclePosition = ((totalStreak - 1) % 10) + 1 // 1-10, 1-10, 1-10...

  // Award Set 1 badge (daily_streak_1 through daily_streak_10)
  if (totalStreak > lastMilestone) {
    const badge = await Badge.findOne({
      code: `daily_streak_${cyclePosition}`,
      active: true
    })

    let streakBadgeAwarded = false
    if (badge) {
      try {
        await UserBadge.create({
          userId,
          badgeId: badge._id,
          earnedAt: new Date(),
          metadata: { streakCount: totalStreak, cyclePosition }
        })
        badgesAwarded.push(badge.code)
        streakBadgeAwarded = true
      } catch (err: any) {
        if (err?.code === 11000) {
          // Duplicate badge (already awarded) - treat as awarded
          streakBadgeAwarded = true
        } else {
          console.error('Daily streak badge award failed:', err)
        }
      }
    }

    if (streakBadgeAwarded) {
      state.badges.lastDailyStreakMilestone = Math.max(
        state.badges.lastDailyStreakMilestone || 0,
        totalStreak
      )
      state.earnedStreaks.highestDaily = Math.max(
        state.earnedStreaks.highestDaily || 0,
        totalStreak
      )
    }
  }

  // Award Set 2 milestone badge at 10, 20, 30, 40, 50
  if (totalStreak % 10 === 0 && totalStreak <= 50) {
    const milestoneNumber = totalStreak / 10 // 1, 2, 3, 4, 5
    const milestoneBadge = await Badge.findOne({
      code: `daily_milestone_${milestoneNumber}`,
      active: true
    })

    if (milestoneBadge) {
      try {
        await UserBadge.create({
          userId,
          badgeId: milestoneBadge._id,
          earnedAt: new Date(),
          metadata: { totalStreak, milestoneNumber }
        })
        badgesAwarded.push(milestoneBadge.code)
      } catch (err) {
        // Duplicate badge - ignore
      }
    }

    // Update milestone count
    state.badges.dailyStreakMilestoneCount = milestoneNumber
  }

  await state.save()

  return { newStreak: totalStreak, badgesAwarded, photocardAwarded }
}

/**
 * Update weekly streak after completing all weekly quests
 *
 * Badge System:
 * - Set 3: Weekly streak badges 1-10 (awarded for weeks 1-10 of each cycle)
 * - Set 4: Milestone badges (awarded at 10, 20, 30, 40, 50 total streaks)
 *
 * Flow: User completes streaks 1-10, then it loops back to 1-10 again for new highs.
 * After a streak break, badges resume only when surpassing the previous high.
 * Every completed week awards a photocard; milestones award the milestone badge.
 */
export async function updateWeeklyStreakAndAwardBadges(userId: string): Promise<{
  newStreak: number
  badgesAwarded: string[]
  photocardAwarded?: any
}> {
  let state = await UserGameState.findOne({ userId })
  if (!state) {
    state = await UserGameState.create({
      userId,
      badges: {
        lastDailyStreakMilestone: 0,
        lastWeeklyStreakMilestone: 0,
        dailyStreakMilestoneCount: 0,
        weeklyStreakMilestoneCount: 0
      }
    })
  }

  const thisWeek = weeklyKey()
  const lastWeek = weeklyKey(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))

  const lastPlayKey = state.streak.lastWeeklyQuestCompletionAt
    ? weeklyKey(state.streak.lastWeeklyQuestCompletionAt)
    : null

  let totalStreak = state.streak.weeklyCount

  if (!lastPlayKey) {
    // First weekly quest completion ever
    totalStreak = 1
  } else if (lastPlayKey === thisWeek) {
    // Already completed all weekly quests this week, no change
    return { newStreak: totalStreak, badgesAwarded: [] }
  } else if (lastPlayKey === lastWeek) {
    // Consecutive week - increment
    totalStreak++

    // Stop at 50 (max milestone)
    if (totalStreak > 50) {
      totalStreak = 50
    }
  } else {
    // Streak broken - reset to 1
    totalStreak = 1
  }

  // Update state
  state.streak.weeklyCount = totalStreak
  state.streak.lastWeeklyQuestCompletionAt = new Date()

  const badgesAwarded: string[] = []
  const lastMilestone = Math.max(
    state.badges?.lastWeeklyStreakMilestone || 0,
    state.earnedStreaks?.highestWeekly || 0
  )
  let photocardAwarded: any = undefined

  // Award photocard for completing all weekly quests (every week).
  const weeklyRoll = await rollRarityAndCardV2({ userId })
  if (weeklyRoll.card) {
    await InventoryItem.create({
      userId,
      cardId: weeklyRoll.card._id,
      acquiredAt: new Date(),
      source: { type: 'weekly_completion', totalStreak }
    })
    photocardAwarded = {
      cardId: weeklyRoll.card._id.toString(),
      rarity: weeklyRoll.rarity,
      category: weeklyRoll.card.categoryDisplay,
      subcategory: weeklyRoll.card.subcategoryPath || null,
      imageUrl: weeklyRoll.card.imageUrl,
      sourceUrl: weeklyRoll.card.sourceUrl || weeklyRoll.card.pageUrl
    }
  }

  // Calculate which badge in the 1-10 cycle to award
  const cyclePosition = ((totalStreak - 1) % 10) + 1 // 1-10, 1-10, 1-10...

  // Award Set 3 badge (weekly_streak_1 through weekly_streak_10)
  if (totalStreak > lastMilestone) {
    const badge = await Badge.findOne({
      code: `weekly_streak_${cyclePosition}`,
      active: true
    })

    let streakBadgeAwarded = false
    if (badge) {
      try {
        await UserBadge.create({
          userId,
          badgeId: badge._id,
          earnedAt: new Date(),
          metadata: { streakCount: totalStreak, cyclePosition }
        })
        badgesAwarded.push(badge.code)
        streakBadgeAwarded = true
      } catch (err: any) {
        if (err?.code === 11000) {
          // Duplicate badge (already awarded) - treat as awarded
          streakBadgeAwarded = true
        } else {
          console.error('Weekly streak badge award failed:', err)
        }
      }
    }

    if (streakBadgeAwarded) {
      state.badges.lastWeeklyStreakMilestone = Math.max(
        state.badges.lastWeeklyStreakMilestone || 0,
        totalStreak
      )
      state.earnedStreaks.highestWeekly = Math.max(
        state.earnedStreaks.highestWeekly || 0,
        totalStreak
      )
    }
  }

  // Award Set 4 milestone badge at 10, 20, 30, 40, 50
  if (totalStreak % 10 === 0 && totalStreak <= 50) {
    const milestoneNumber = totalStreak / 10 // 1, 2, 3, 4, 5
    const milestoneBadge = await Badge.findOne({
      code: `weekly_milestone_${milestoneNumber}`,
      active: true
    })

    if (milestoneBadge) {
      try {
        await UserBadge.create({
          userId,
          badgeId: milestoneBadge._id,
          earnedAt: new Date(),
          metadata: { totalStreak, milestoneNumber }
        })
        badgesAwarded.push(milestoneBadge.code)
      } catch (err) {
        // Duplicate badge - ignore
      }
    }

    // Update milestone count
    state.badges.weeklyStreakMilestoneCount = milestoneNumber
  }

  await state.save()

  return { newStreak: totalStreak, badgesAwarded, photocardAwarded }
}

/**
 * Get user's current daily and weekly streaks
 */
export async function getUserStreaks(userId: string): Promise<{ daily: number; weekly: number }> {
  const state = await UserGameState.findOne({ userId })
  return {
    daily: state?.streak.dailyCount || 0,
    weekly: state?.streak.weeklyCount || 0
  }
}

/**
 * Get user's earned badges
 */
export async function getUserBadges(userId: string): Promise<any[]> {
  const userBadges = await UserBadge.find({ userId })
    .populate('badgeId')
    .sort({ earnedAt: -1 })
    .lean()

  return userBadges.map(ub => ({
    id: (ub as any)._id.toString(),
    badge: {
      code: (ub.badgeId as any).code,
      name: (ub.badgeId as any).name,
      description: (ub.badgeId as any).description || '',
      icon: (ub.badgeId as any).icon,
      rarity: (ub.badgeId as any).rarity,
      type: (ub.badgeId as any).type || 'achievement'
    },
    earnedAt: ub.earnedAt,
    metadata: ub.metadata || {}
  }))
}
