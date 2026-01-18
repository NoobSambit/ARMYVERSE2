/**
 * Badge Image Utility
 * Maps badge codes to their corresponding image paths in /public/badges/
 */

// Mastery milestone levels
const MASTERY_MILESTONES = [5, 10, 25, 50, 100] as const

// Member keys for special badges - normalized to lowercase for path matching
const MEMBER_KEYS = [
  'rm',
  'jin',
  'suga',
  'j-hope',
  'jimin',
  'v',
  'jungkook',
  'ot7',
] as const

/**
 * Normalize member key for file path usage
 * Handles special cases like "J-Hope" -> "jhope"
 */
function normalizeMemberKey(key: string): string {
  return key.toLowerCase().replace(/-/g, '')
}

/**
 * Get the image path for a mastery badge
 * @param kind - 'member' or 'era'
 * @param key - The member name or era name
 * @param milestone - The milestone level (5, 10, 25, 50, 100)
 */
export function getMasteryBadgeImagePath(
  kind: 'member' | 'era',
  key: string,
  milestone: number
): string {
  // For level 100, use special member-specific badges for members
  if (milestone === 100 && kind === 'member') {
    const normalizedKey = normalizeMemberKey(key)
    return `/badges/mastery/special/${normalizedKey}-100.svg`
  }

  // For all other milestones, use generic milestone badges
  return `/badges/mastery/milestone-${milestone}.png`
}

/**
 * Get mastery badge rarity based on milestone level
 */
export function getMasteryBadgeRarity(
  milestone: number
): 'common' | 'rare' | 'epic' | 'legendary' {
  switch (milestone) {
    case 5:
      return 'common'
    case 10:
      return 'rare'
    case 25:
      return 'rare'
    case 50:
      return 'epic'
    case 100:
      return 'legendary'
    default:
      return 'common'
  }
}

export function getBadgeImagePath(badgeCode: string): string {
  // Handle mastery badges with pattern: mastery_{kind}_{key}_{milestone}
  if (badgeCode.startsWith('mastery_')) {
    const parts = badgeCode.split('_')
    if (parts.length >= 4) {
      const kind = parts[1] as 'member' | 'era'
      const key = parts.slice(2, -1).join('_') // Handle keys with underscores
      const milestone = parseInt(parts[parts.length - 1], 10)
      return getMasteryBadgeImagePath(kind, key, milestone)
    }
  }

  const mapping: Record<string, string> = {
    // Completion badges
    daily_completion: '/badges/completion/daily-completion.png',
    weekly_completion: '/badges/completion/weekly-completion.png',

    // Daily streak badges (1-10)
    ...Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [
        `daily_streak_${i + 1}`,
        `/badges/daily-streak/streak-${i + 1}.png`,
      ])
    ),

    // Daily milestone badges (1-5)
    ...Object.fromEntries(
      Array.from({ length: 5 }, (_, i) => [
        `daily_milestone_${i + 1}`,
        `/badges/daily-milestone/milestone-${i + 1}.png`,
      ])
    ),

    // Weekly streak badges (1-10)
    ...Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [
        `weekly_streak_${i + 1}`,
        `/badges/weekly-streak/streak-${i + 1}.png`,
      ])
    ),

    // Weekly milestone badges (1-5)
    ...Object.fromEntries(
      Array.from({ length: 5 }, (_, i) => [
        `weekly_milestone_${i + 1}`,
        `/badges/weekly-milestone/milestone-${i + 1}.png`,
      ])
    ),

    // Mastery milestone badges (generic - for era badges or when no special badge exists)
    ...Object.fromEntries(
      MASTERY_MILESTONES.map(level => [
        `mastery_milestone_${level}`,
        `/badges/mastery/milestone-${level}.png`,
      ])
    ),

    // Mastery special member badges (level 100)
    ...Object.fromEntries(
      MEMBER_KEYS.map(member => [
        `mastery_member_${member}_100`,
        `/badges/mastery/special/${normalizeMemberKey(member)}-100.svg`,
      ])
    ),

    // Mastery special member badges (level 100)
    ...Object.fromEntries(
      MEMBER_KEYS.map(member => [
        `mastery_member_${member}_100`,
        `/badges/mastery/special/${normalizeMemberKey(member)}-100.png`,
      ])
    ),

    // Mastery special member badges (level 100)
    ...Object.fromEntries(
      MEMBER_KEYS.map(member => [
        `mastery_member_${member}_100`,
        `/badges/mastery/special/${normalizeMemberKey(member)}-100.svg`,
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
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]',
      }
    case 'epic':
      return {
        border: 'border-purple-500/50',
        bg: 'bg-purple-500/20',
        text: 'text-purple-400',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
      }
    case 'rare':
      return {
        border: 'border-blue-500/50',
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
      }
    default: // common
      return {
        border: 'border-gray-500/50',
        bg: 'bg-gray-500/20',
        text: 'text-gray-400',
        glow: '',
      }
  }
}

/**
 * Get badge category from code
 */
export function getBadgeCategory(badgeCode: string): string {
  if (badgeCode.startsWith('mastery_member')) return 'Member Mastery'
  if (badgeCode.startsWith('mastery_era')) return 'Era Mastery'
  if (badgeCode.startsWith('mastery_')) return 'Mastery'
  if (badgeCode.includes('daily_streak')) return 'Daily Streak'
  if (badgeCode.includes('daily_milestone')) return 'Daily Milestone'
  if (badgeCode.includes('weekly_streak')) return 'Weekly Streak'
  if (badgeCode.includes('weekly_milestone')) return 'Weekly Milestone'
  if (badgeCode.includes('daily_completion')) return 'Daily Completion'
  if (badgeCode.includes('weekly_completion')) return 'Weekly Completion'
  return 'Other'
}
