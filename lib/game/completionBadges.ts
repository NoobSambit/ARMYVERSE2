import { UserQuestProgress } from '@/lib/models/UserQuestProgress'
import { Badge } from '@/lib/models/Badge'
import { UserBadge } from '@/lib/models/UserBadge'
import { dailyKey, getActiveQuests, weeklyKey } from './quests'

/**
 * Check if user has completed all daily quests (streaming + quiz)
 * and award completion badge if they have
 */
export async function checkAndAwardDailyCompletionBadge(userId: string): Promise<{
  allCompleted: boolean
  badgeAwarded?: string
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

  // Award daily completion badge
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
        metadata: { completionDate: dKey }
      })
      return { allCompleted: true, badgeAwarded: badge.code }
    } catch (err) {
      // Duplicate badge for this day - already awarded
      return { allCompleted: true }
    }
  }

  return { allCompleted: true }
}

/**
 * Check if user has completed all weekly quests (streaming + quiz)
 * and award completion badge if they have
 */
export async function checkAndAwardWeeklyCompletionBadge(userId: string): Promise<{
  allCompleted: boolean
  badgeAwarded?: string
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

  // Award weekly completion badge
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
        metadata: { completionDate: wKey }
      })
      return { allCompleted: true, badgeAwarded: badge.code }
    } catch (err) {
      // Duplicate badge for this week - already awarded
      return { allCompleted: true }
    }
  }

  return { allCompleted: true }
}
