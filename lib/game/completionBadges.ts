import { UserQuestProgress } from '@/lib/models/UserQuestProgress'
import { Badge } from '@/lib/models/Badge'
import { UserBadge } from '@/lib/models/UserBadge'
import { UserGameState } from '@/lib/models/UserGameState'
import { dailyKey, getActiveQuests, weeklyKey } from './quests'

/**
 * Check if user has completed all daily quests (streaming + quiz).
 * When awardCompletionBadge is true, award completion badge if they have.
 * 
 * NEW: Only awards completion badge for unique/first-time streak achievements.
 * If user already achieved streak 5 before, they won't get the completion badge
 * when reaching streak 5 again after breaking and restarting their streak.
 */
export async function checkAndAwardDailyCompletionBadge(
  userId: string,
  options: { awardCompletionBadge?: boolean } = {}
): Promise<{
  allCompleted: boolean
  badgeAwarded?: string
  streakCount?: number
  isUniqueStreak?: boolean
}> {
  const dKey = dailyKey()

  // Get all active daily quest definitions
  const dailyQuests = (await getActiveQuests()).filter(q => q.period === 'daily')

  if (dailyQuests.length === 0) {
    return { allCompleted: false }
  }

  // Get user's progress for all daily quests
  const questCodes = dailyQuests.map(q => q.code)
  const progresses = await UserQuestProgress.find({
    userId,
    code: { $in: questCodes },
    periodKey: dKey
  }).lean()

  // Check if all quests are completed and claimed
  const allCompleted = dailyQuests.every(quest => {
    const progress = progresses.find(p => p.code === quest.code)
    return progress && progress.completed && progress.claimed
  })

  if (!allCompleted) {
    return { allCompleted: false }
  }

  if (!options.awardCompletionBadge) {
    return { allCompleted: true }
  }

  // Get user's game state to check current streak and earned streaks
  let state = await UserGameState.findOne({ userId })
  if (!state) {
    return { allCompleted: true }
  }

  const currentStreak = state.streak.dailyCount
  const earnedDaily = state.earnedStreaks?.daily || []

  // Check if this streak count has already been rewarded
  const isUniqueStreak = !earnedDaily.includes(currentStreak)

  if (!isUniqueStreak) {
    // User already earned this streak before, don't award completion badge
    return {
      allCompleted: true,
      streakCount: currentStreak,
      isUniqueStreak: false
    }
  }

  // Award daily completion badge for unique streak
  const badge = await Badge.findOne({
    code: 'daily_completion',
    type: 'completion',
    active: true
  })

  if (badge) {
    try {
      await UserBadge.create({
        userId,
        badgeId: badge._id,
        earnedAt: new Date(),
        metadata: {
          completionDate: dKey,
          completionStreakCount: currentStreak,
          completionType: 'daily'
        }
      })

      // Update earned streaks tracking
      if (!state.earnedStreaks) {
        state.earnedStreaks = {
          daily: [],
          weekly: [],
          highestDaily: 0,
          highestWeekly: 0
        }
      }
      state.earnedStreaks.daily.push(currentStreak)
      if (currentStreak > (state.earnedStreaks.highestDaily || 0)) {
        state.earnedStreaks.highestDaily = currentStreak
      }
      await state.save()

      return {
        allCompleted: true,
        badgeAwarded: badge.code,
        streakCount: currentStreak,
        isUniqueStreak: true
      }
    } catch (err) {
      // Duplicate badge for this day - already awarded
      return {
        allCompleted: true,
        streakCount: currentStreak,
        isUniqueStreak: true
      }
    }
  }

  return {
    allCompleted: true,
    streakCount: currentStreak,
    isUniqueStreak: true
  }
}

/**
 * Check if user has completed all weekly quests (streaming + quiz).
 * When awardCompletionBadge is true, award completion badge if they have.
 * 
 * NEW: Only awards completion badge for unique/first-time streak achievements.
 * If user already achieved streak 5 before, they won't get the completion badge
 * when reaching streak 5 again after breaking and restarting their streak.
 */
export async function checkAndAwardWeeklyCompletionBadge(
  userId: string,
  options: { awardCompletionBadge?: boolean } = {}
): Promise<{
  allCompleted: boolean
  badgeAwarded?: string
  streakCount?: number
  isUniqueStreak?: boolean
}> {
  const wKey = weeklyKey()

  // Get all active weekly quest definitions
  const weeklyQuests = (await getActiveQuests()).filter(q => q.period === 'weekly')

  if (weeklyQuests.length === 0) {
    return { allCompleted: false }
  }

  // Get user's progress for all weekly quests
  const questCodes = weeklyQuests.map(q => q.code)
  const progresses = await UserQuestProgress.find({
    userId,
    code: { $in: questCodes },
    periodKey: wKey
  }).lean()

  // Check if all quests are completed and claimed
  const allCompleted = weeklyQuests.every(quest => {
    const progress = progresses.find(p => p.code === quest.code)
    return progress && progress.completed && progress.claimed
  })

  if (!allCompleted) {
    return { allCompleted: false }
  }

  if (!options.awardCompletionBadge) {
    return { allCompleted: true }
  }

  // Get user's game state to check current streak and earned streaks
  let state = await UserGameState.findOne({ userId })
  if (!state) {
    return { allCompleted: true }
  }

  const currentStreak = state.streak.weeklyCount
  const earnedWeekly = state.earnedStreaks?.weekly || []

  // Check if this streak count has already been rewarded
  const isUniqueStreak = !earnedWeekly.includes(currentStreak)

  if (!isUniqueStreak) {
    // User already earned this streak before, don't award completion badge
    return {
      allCompleted: true,
      streakCount: currentStreak,
      isUniqueStreak: false
    }
  }

  // Award weekly completion badge for unique streak
  const badge = await Badge.findOne({
    code: 'weekly_completion',
    type: 'completion',
    active: true
  })

  if (badge) {
    try {
      await UserBadge.create({
        userId,
        badgeId: badge._id,
        earnedAt: new Date(),
        metadata: {
          completionDate: wKey,
          completionStreakCount: currentStreak,
          completionType: 'weekly'
        }
      })

      // Update earned streaks tracking
      if (!state.earnedStreaks) {
        state.earnedStreaks = {
          daily: [],
          weekly: [],
          highestDaily: 0,
          highestWeekly: 0
        }
      }
      state.earnedStreaks.weekly.push(currentStreak)
      if (currentStreak > (state.earnedStreaks.highestWeekly || 0)) {
        state.earnedStreaks.highestWeekly = currentStreak
      }
      await state.save()

      return {
        allCompleted: true,
        badgeAwarded: badge.code,
        streakCount: currentStreak,
        isUniqueStreak: true
      }
    } catch (err) {
      // Duplicate badge for this week - already awarded
      return {
        allCompleted: true,
        streakCount: currentStreak,
        isUniqueStreak: true
      }
    }
  }

  return {
    allCompleted: true,
    streakCount: currentStreak,
    isUniqueStreak: true
  }
}
