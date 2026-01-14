/**
 * Leaderboard utility functions
 * Centralized period key generation and leaderboard helpers
 */

import { getLevelProgress } from '@/lib/game/leveling'

export type PeriodType = 'daily' | 'weekly' | 'alltime'

/**
 * Generates period keys for different timeframes
 * - Daily: daily-YYYY-MM-DD
 * - Weekly: weekly-YYYY-WW (ISO week)
 * - Alltime: alltime
 */
export function getPeriodKeys(type: PeriodType, date = new Date()): { periodKey: string; periodStart: Date; periodEnd: Date } {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

  if (type === 'daily') {
    const periodStart = new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), 0, 0, 0, 0))
    const periodEnd = new Date(periodStart)
    periodEnd.setUTCDate(periodEnd.getUTCDate() + 1)
    return {
      periodKey: `daily-${utcDate.getUTCFullYear()}-${String(utcDate.getUTCMonth() + 1).padStart(2, '0')}-${String(utcDate.getUTCDate()).padStart(2, '0')}`,
      periodStart,
      periodEnd
    }
  }

  if (type === 'weekly') {
    // ISO week calculation (Monday as first day)
    const tmp = new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()))
    const dayNum = tmp.getUTCDay() || 7
    const periodStart = new Date(tmp)
    periodStart.setUTCDate(tmp.getUTCDate() - dayNum + 1)
    periodStart.setUTCHours(0, 0, 0, 0)
    const periodEnd = new Date(periodStart)
    periodEnd.setUTCDate(periodEnd.getUTCDate() + 7)
    const yearStart = new Date(Date.UTC(periodStart.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil((((periodStart.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    return {
      periodKey: `weekly-${periodStart.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`,
      periodStart,
      periodEnd
    }
  }

  // Alltime
  return {
    periodKey: 'alltime',
    periodStart: new Date(Date.UTC(2020, 0, 1)),
    periodEnd: new Date(Date.UTC(2100, 0, 1))
  }
}

/**
 * Calculate level from total XP using the progressive curve.
 * @param totalXp - Total XP accumulated
 * @returns Player level
 */
export function calculateLevel(totalXp: number): number {
  return getLevelProgress(totalXp).level
}

/**
 * Calculate XP progress within current level using the progressive curve.
 * @param totalXp - Total XP accumulated
 * @returns Object with progress (0-100) and xpToNextLevel
 */
export function calculateXpProgress(totalXp: number): { progress: number; xpToNextLevel: number } {
  const progress = getLevelProgress(totalXp)
  return {
    progress: progress.progressPercent,
    xpToNextLevel: progress.xpToNextLevel
  }
}

/**
 * Format rank change for display
 * @param change - Rank change value (positive = improved, negative = declined)
 * @returns Formatted string with icon
 */
export function formatRankChange(change: number | null | undefined): string {
  if (change === null || change === undefined) return '-'
  if (change > 0) return `↑${change}`
  if (change < 0) return `↓${Math.abs(change)}`
  return '0'
}

/**
 * Get percentile category based on rank
 * @param rank - Player's rank
 * @returns String describing percentile
 */
export function getPercentileCategory(rank: number): string {
  if (rank <= 10) return 'Top 1%'
  if (rank <= 50) return 'Top 5%'
  if (rank <= 100) return 'Top 10%'
  if (rank <= 500) return 'Top 25%'
  if (rank <= 1000) return 'Top 50%'
  return 'Top 100%'
}
