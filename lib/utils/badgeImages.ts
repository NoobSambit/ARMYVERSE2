/**
 * Badge Image Utility
 * Maps badge codes to their corresponding image paths in /public/badges/
 */

export function getBadgeImagePath(badgeCode: string): string {
  const mapping: Record<string, string> = {
    // Completion badges
    'daily_completion': '/badges/completion/daily-completion.png',
    'weekly_completion': '/badges/completion/weekly-completion.png',

    // Daily streak badges (1-10)
    ...Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [
        `daily_streak_${i + 1}`,
        `/badges/daily-streak/streak-${i + 1}.png`
      ])
    ),

    // Daily milestone badges (1-5)
    ...Object.fromEntries(
      Array.from({ length: 5 }, (_, i) => [
        `daily_milestone_${i + 1}`,
        `/badges/daily-milestone/milestone-${i + 1}.png`
      ])
    ),

    // Weekly streak badges (1-10)
    ...Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [
        `weekly_streak_${i + 1}`,
        `/badges/weekly-streak/streak-${i + 1}.png`
      ])
    ),

    // Weekly milestone badges (1-5)
    ...Object.fromEntries(
      Array.from({ length: 5 }, (_, i) => [
        `weekly_milestone_${i + 1}`,
        `/badges/weekly-milestone/milestone-${i + 1}.png`
      ])
    ),
  }

  return mapping[badgeCode] || '/badges/placeholder.png'
}

/**
 * Get rarity color classes for badges
 */
export function getBadgeRarityColors(rarity: string): {
  border: string
  bg: string
  text: string
  glow: string
} {
  switch (rarity) {
    case 'legendary':
      return {
        border: 'border-yellow-500/50',
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]'
      }
    case 'epic':
      return {
        border: 'border-purple-500/50',
        bg: 'bg-purple-500/20',
        text: 'text-purple-400',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]'
      }
    case 'rare':
      return {
        border: 'border-blue-500/50',
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]'
      }
    default: // common
      return {
        border: 'border-gray-500/50',
        bg: 'bg-gray-500/20',
        text: 'text-gray-400',
        glow: ''
      }
  }
}

/**
 * Get badge category from code
 */
export function getBadgeCategory(badgeCode: string): string {
  if (badgeCode.includes('daily_streak')) return 'Daily Streak'
  if (badgeCode.includes('daily_milestone')) return 'Daily Milestone'
  if (badgeCode.includes('weekly_streak')) return 'Weekly Streak'
  if (badgeCode.includes('weekly_milestone')) return 'Weekly Milestone'
  if (badgeCode.includes('daily_completion')) return 'Daily Completion'
  if (badgeCode.includes('weekly_completion')) return 'Weekly Completion'
  return 'Other'
}
