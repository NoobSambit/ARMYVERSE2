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
 * Flow: User completes streaks 1-10, then it loops back to 1-10 again
 * At every 10th streak (10, 20, 30, 40, 50), award milestone badge + photocard
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
    if (state.badges) {
      state.badges.lastDailyStreakMilestone = 0
    }
  }

  // Update state
  state.streak.dailyCount = totalStreak
  state.streak.lastDailyQuestCompletionAt = new Date()

  const badgesAwarded: string[] = []
  const lastMilestone = state.badges?.lastDailyStreakMilestone || 0
  let photocardAwarded: any = undefined

  // Calculate which badge in the 1-10 cycle to award
  const cyclePosition = ((totalStreak - 1) % 10) + 1 // 1-10, 1-10, 1-10...

  // Award Set 1 badge (daily_streak_1 through daily_streak_10)
  if (totalStreak > lastMilestone) {
    const badge = await Badge.findOne({
      code: `daily_streak_${cyclePosition}`,
      active: true
    })

    if (badge) {
      try {
        await UserBadge.create({
          userId,
          badgeId: badge._id,
          earnedAt: new Date(),
          metadata: { streakCount: totalStreak, cyclePosition }
        })
        badgesAwarded.push(badge.code)
      } catch (err) {
        // Duplicate badge (already awarded) - ignore
      }
    }

    // Update last milestone
    if (!state.badges) {
      state.badges = {
        lastDailyStreakMilestone: 0,
        lastWeeklyStreakMilestone: 0,
        dailyStreakMilestoneCount: 0,
        weeklyStreakMilestoneCount: 0
      }
    }
    state.badges.lastDailyStreakMilestone = totalStreak
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

    // Award photocard for milestone
    const roll = await rollRarityAndCardV2({ userId })
    if (roll.card) {
      await InventoryItem.create({
        userId,
        cardId: roll.card._id,
        acquiredAt: new Date(),
        source: { type: 'daily_milestone', totalStreak, milestoneNumber }
      })
      photocardAwarded = {
        cardId: roll.card._id.toString(),
        rarity: roll.rarity,
        category: roll.card.categoryDisplay,
        subcategory: roll.card.subcategoryPath || null,
        imageUrl: roll.card.imageUrl,
        sourceUrl: roll.card.sourceUrl || roll.card.pageUrl
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
 * Flow: User completes streaks 1-10, then it loops back to 1-10 again
 * At every 10th streak (10, 20, 30, 40, 50), award milestone badge + photocard
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
    if (state.badges) {
      state.badges.lastWeeklyStreakMilestone = 0
    }
  }

  // Update state
  state.streak.weeklyCount = totalStreak
  state.streak.lastWeeklyQuestCompletionAt = new Date()

  const badgesAwarded: string[] = []
  const lastMilestone = state.badges?.lastWeeklyStreakMilestone || 0
  let photocardAwarded: any = undefined

  // Calculate which badge in the 1-10 cycle to award
  const cyclePosition = ((totalStreak - 1) % 10) + 1 // 1-10, 1-10, 1-10...

  // Award Set 3 badge (weekly_streak_1 through weekly_streak_10)
  if (totalStreak > lastMilestone) {
    const badge = await Badge.findOne({
      code: `weekly_streak_${cyclePosition}`,
      active: true
    })

    if (badge) {
      try {
        await UserBadge.create({
          userId,
          badgeId: badge._id,
          earnedAt: new Date(),
          metadata: { streakCount: totalStreak, cyclePosition }
        })
        badgesAwarded.push(badge.code)
      } catch (err) {
        // Duplicate badge (already awarded) - ignore
      }
    }

    // Update last milestone
    if (!state.badges) {
      state.badges = {
        lastDailyStreakMilestone: 0,
        lastWeeklyStreakMilestone: 0,
        dailyStreakMilestoneCount: 0,
        weeklyStreakMilestoneCount: 0
      }
    }
    state.badges.lastWeeklyStreakMilestone = totalStreak
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

    // Award photocard for milestone
    const roll = await rollRarityAndCardV2({ userId })
    if (roll.card) {
      await InventoryItem.create({
        userId,
        cardId: roll.card._id,
        acquiredAt: new Date(),
        source: { type: 'weekly_milestone', totalStreak, milestoneNumber }
      })
      photocardAwarded = {
        cardId: roll.card._id.toString(),
        rarity: roll.rarity,
        category: roll.card.categoryDisplay,
        subcategory: roll.card.subcategoryPath || null,
        imageUrl: roll.card.imageUrl,
        sourceUrl: roll.card.sourceUrl || roll.card.pageUrl
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
    code: (ub.badgeId as any).code,
    name: (ub.badgeId as any).name,
    description: (ub.badgeId as any).description,
    icon: (ub.badgeId as any).icon,
    rarity: (ub.badgeId as any).rarity,
    earnedAt: ub.earnedAt,
    metadata: ub.metadata
  }))
}
