import { UserGameState } from '@/lib/models/UserGameState'
import { LeaderboardEntry } from '@/lib/models/LeaderboardEntry'
import { getLevelProgress } from '@/lib/game/leveling'
import { getPeriodKeys, type PeriodType } from '@/lib/game/leaderboard'
import type { Rarity } from './dropTable'

export type BalanceAward = {
  dust?: number
  xp?: number
}

export type BalanceAwardResult = {
  dust: number
  xp: number
  level: number
  xpIntoLevel: number
  xpForNextLevel: number
  xpToNextLevel: number
  progressPercent: number
}

export type AwardBalancesOptions = {
  updateLeaderboard?: boolean
  leaderboardProfile?: {
    displayName?: string
    avatarUrl?: string
  }
  activityAt?: Date
}

const DUPLICATE_DUST = 20

export function duplicateDustForRarity(_rarity: Rarity | null | undefined) {
  void _rarity
  return DUPLICATE_DUST
}

type IncUpdate = {
  dust?: number
  xp?: number
}

type SetOnInsertUpdate = {
  dust?: number
  xp?: number
  level?: number
}

export async function awardBalances(
  userId: string,
  award: BalanceAward,
  options: AwardBalancesOptions = {}
): Promise<BalanceAwardResult> {
  const inc: IncUpdate = {}
  if (typeof award.dust === 'number' && award.dust !== 0) inc.dust = award.dust
  if (typeof award.xp === 'number' && award.xp !== 0) inc.xp = award.xp

  const update: { $setOnInsert?: SetOnInsertUpdate; $inc?: IncUpdate } = {}
  if (Object.keys(inc).length) update.$inc = inc

  const setOnInsert: SetOnInsertUpdate = { level: 1 }
  if (!('dust' in inc)) setOnInsert.dust = 0
  if (!('xp' in inc)) setOnInsert.xp = 0
  if (Object.keys(setOnInsert).length) update.$setOnInsert = setOnInsert

  const res = await UserGameState.findOneAndUpdate(
    { userId },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean<{ dust?: number; xp?: number; level?: number }>()

  const totalXp = res?.xp || 0
  const levelProgress = getLevelProgress(totalXp)
  if (res && res.level !== levelProgress.level) {
    await UserGameState.updateOne(
      { userId, xp: totalXp },
      { $set: { level: levelProgress.level } }
    )
  }

  const xpDelta = typeof award.xp === 'number' ? award.xp : 0
  const shouldUpdateLeaderboard = (options.updateLeaderboard ?? true) && xpDelta > 0
  if (shouldUpdateLeaderboard) {
    const now = options.activityAt || new Date()
    const periods: PeriodType[] = ['daily', 'weekly', 'alltime']
    const profileSet: Record<string, string> = {}
    if (options.leaderboardProfile?.displayName) {
      profileSet.displayName = options.leaderboardProfile.displayName
    }
    if (options.leaderboardProfile?.avatarUrl) {
      profileSet.avatarUrl = options.leaderboardProfile.avatarUrl
    }

    await Promise.all(periods.map((period) => {
      const { periodKey, periodStart, periodEnd } = getPeriodKeys(period, now)
      const setFields: Record<string, unknown> = {
        level: levelProgress.level,
        lastPlayedAt: now,
        updatedAt: now,
        ...profileSet
      }
      const update: {
        $set: Record<string, unknown>
        $setOnInsert: Record<string, unknown>
        $inc?: Record<string, number>
      } = {
        $set: setFields,
        $setOnInsert: {
          periodStart,
          periodEnd,
          stats: { quizzesPlayed: 0, questionsCorrect: 0, totalQuestions: 0 }
        }
      }

      // All periods use $inc for consistent score accumulation.
      // This ensures that:
      // 1. New users start at 0 and accumulate XP correctly
      // 2. Race conditions don't cause score overwrites
      // 3. All three leaderboards (daily, weekly, alltime) behave identically
      update.$inc = { score: xpDelta }

      return LeaderboardEntry.updateOne(
        { periodKey, userId },
        update,
        { upsert: true, setDefaultsOnInsert: true }
      )
    }))
  }

  return {
    dust: res?.dust || 0,
    xp: totalXp,
    level: levelProgress.level,
    xpIntoLevel: levelProgress.xpIntoLevel,
    xpForNextLevel: levelProgress.xpForNextLevel,
    xpToNextLevel: levelProgress.xpToNextLevel,
    progressPercent: levelProgress.progressPercent
  }
}
