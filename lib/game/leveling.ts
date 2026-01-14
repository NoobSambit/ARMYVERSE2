export const LEVEL_XP_BASE = 100
export const LEVEL_XP_GROWTH = 1.25

export type LevelProgress = {
  level: number
  nextLevel: number
  totalXp: number
  xpIntoLevel: number
  xpForNextLevel: number
  xpToNextLevel: number
  progressPercent: number
  totalXpForNextLevel: number
}

export function xpForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level))
  const raw = LEVEL_XP_BASE * Math.pow(LEVEL_XP_GROWTH, safeLevel - 1)
  return Math.max(1, Math.round(raw))
}

export function totalXpForLevel(level: number): number {
  const targetLevel = Math.max(1, Math.floor(level))
  let total = 0
  for (let current = 1; current < targetLevel; current += 1) {
    total += xpForLevel(current)
  }
  return total
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const safeXp = Math.max(0, Math.floor(totalXp || 0))
  let level = 1
  let remaining = safeXp
  let xpForNext = xpForLevel(level)

  while (remaining >= xpForNext) {
    remaining -= xpForNext
    level += 1
    xpForNext = xpForLevel(level)
  }

  const xpIntoLevel = remaining
  const xpToNextLevel = xpForNext - xpIntoLevel
  const progressPercent = xpForNext > 0
    ? Math.min(100, Math.max(0, (xpIntoLevel / xpForNext) * 100))
    : 0
  const nextLevel = level + 1

  return {
    level,
    nextLevel,
    totalXp: safeXp,
    xpIntoLevel,
    xpForNextLevel: xpForNext,
    xpToNextLevel,
    progressPercent,
    totalXpForNextLevel: safeXp + xpToNextLevel
  }
}
