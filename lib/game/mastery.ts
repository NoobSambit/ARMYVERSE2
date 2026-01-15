import { MasteryProgress } from '@/lib/models/MasteryProgress'

export type MasteryIncrement = {
  members: string[]
  eras: string[]
  xp: number
}

export type MasteryDefinition = { key: string; displayName?: string; coverImage?: string; order?: number }
export type MasteryTrack = { kind: 'member' | 'era'; key: string; xp: number; level: number; claimedMilestones: number[]; xpToNext: number; nextMilestone: number | null; claimable: number[] }

export const MASTERY_MILESTONES: {
  level: number
  rewards: { xp: number; dust: number }
  badge: {
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    description: string
    isSpecialAtMax: boolean // true = special badge at lvl 100 for members
  }
}[] = [
    {
      level: 5,
      rewards: { xp: 50, dust: 25 },
      badge: { rarity: 'common', description: 'First steps towards mastery', isSpecialAtMax: false }
    },
    {
      level: 10,
      rewards: { xp: 100, dust: 75 },
      badge: { rarity: 'rare', description: 'Growing dedication and knowledge', isSpecialAtMax: false }
    },
    {
      level: 25,
      rewards: { xp: 250, dust: 200 },
      badge: { rarity: 'rare', description: 'Proven commitment to the journey', isSpecialAtMax: false }
    },
    {
      level: 50,
      rewards: { xp: 500, dust: 400 },
      badge: { rarity: 'epic', description: 'An expert in the making', isSpecialAtMax: false }
    },
    {
      level: 100,
      rewards: { xp: 1500, dust: 1000 },
      badge: { rarity: 'legendary', description: 'Ultimate mastery achieved - A true legend!', isSpecialAtMax: true }
    }
  ]

const MEMBER_DEFS: MasteryDefinition[] = [
  { key: 'RM', order: 1 },
  { key: 'Jin', order: 2 },
  { key: 'Suga', order: 3 },
  { key: 'J-Hope', order: 4 },
  { key: 'Jimin', order: 5 },
  { key: 'V', order: 6 },
  { key: 'Jungkook', order: 7 },
  { key: 'OT7', order: 8, displayName: 'OT7' }
]

const ERA_DEFS: MasteryDefinition[] = [
  // Group eras
  { key: '2 Cool 4 Skool', order: 1 },
  { key: 'O!RUL8,2?', order: 2 },
  { key: 'Skool Luv Affair', order: 3 },
  { key: 'Dark & Wild', order: 4 },
  { key: 'HYYH', order: 5 },
  { key: 'Wings', order: 6 },
  { key: 'You Never Walk Alone', order: 7 },
  { key: 'Love Yourself: Her', order: 8 },
  { key: 'Love Yourself: Tear', order: 9 },
  { key: 'Love Yourself: Answer', order: 10 },
  { key: 'Map of the Soul: Persona', order: 11 },
  { key: 'Map of the Soul: 7', order: 12 },
  { key: 'BE', order: 13 },
  { key: 'Proof', order: 14 },
  // Solo eras
  { key: 'RM', order: 20 },
  { key: 'Mono', order: 21 },
  { key: 'Indigo', order: 22 },
  { key: 'Agust D', order: 23 },
  { key: 'D-2', order: 24 },
  { key: 'D-Day', order: 25 },
  { key: 'Hope World', order: 26 },
  { key: 'Jack In The Box', order: 27 },
  { key: 'FACE', order: 28 },
  { key: 'Layover', order: 29 }
]

export function getMasteryDefinitions() {
  return { members: MEMBER_DEFS, eras: ERA_DEFS }
}

export async function addMasteryXp(userId: string, inc: MasteryIncrement) {
  const now = new Date()
  const updates: Promise<any>[] = []
  for (const m of inc.members) {
    updates.push(MasteryProgress.findOneAndUpdate(
      { userId, kind: 'member', key: m },
      { $inc: { xp: inc.xp }, $setOnInsert: { level: 0, claimedMilestones: [] }, $set: { lastUpdatedAt: now } },
      { upsert: true, new: true }
    ))
  }
  for (const e of inc.eras) {
    updates.push(MasteryProgress.findOneAndUpdate(
      { userId, kind: 'era', key: e },
      { $inc: { xp: inc.xp }, $setOnInsert: { level: 0, claimedMilestones: [] }, $set: { lastUpdatedAt: now } },
      { upsert: true, new: true }
    ))
  }
  await Promise.all(updates)
}

export function dividerFor(kind: 'member' | 'era', key: string) {
  if (kind === 'member' && key.toUpperCase() === 'OT7') return 7
  return 1
}

export function levelForXp(xp: number, divider = 1) {
  // Threshold scaled by divider (e.g., OT7 uses divider 7)
  return Math.floor(xp / (100 * Math.max(1, divider)))
}

export function xpToNextLevel(xp: number, divider = 1) {
  const level = levelForXp(xp, divider)
  const perLevel = 100 * Math.max(1, divider)
  return Math.max(0, (level + 1) * perLevel - xp)
}

export function claimableMilestones(xp: number, claimed: number[], legacyLevel = 0, divider = 1) {
  const currentLevel = levelForXp(xp, divider)
  const alreadyClaimed = new Set([...claimed, legacyLevel || 0])
  return MASTERY_MILESTONES.filter(m => m.level <= currentLevel && !alreadyClaimed.has(m.level)).map(m => m.level)
}

export function nextMilestone(xp: number, divider = 1) {
  const currentLevel = levelForXp(xp, divider)
  const milestone = MASTERY_MILESTONES.find(m => m.level > currentLevel)
  return milestone?.level ?? null
}

export function formatTrack(kind: 'member' | 'era', key: string, xp: number, claimed: number[], legacyLevel = 0): MasteryTrack {
  const divider = dividerFor(kind, key)
  const level = levelForXp(xp, divider)
  return {
    kind,
    key,
    xp,
    level,
    claimedMilestones: claimed,
    xpToNext: xpToNextLevel(xp, divider),
    nextMilestone: nextMilestone(xp, divider),
    claimable: claimableMilestones(xp, claimed, legacyLevel, divider)
  }
}

/**
 * Generate a consistent badge code for mastery milestones
 * Format: mastery_{kind}_{normalized_key}_{milestone}
 * Example: mastery_member_rm_5, mastery_era_wings_100
 */
export function getMasteryBadgeCode(kind: 'member' | 'era', key: string, milestone: number): string {
  // Normalize key: lowercase, replace spaces/special chars with underscores
  const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  return `mastery_${kind}_${normalizedKey}_${milestone}`
}

/**
 * Get badge info for a specific milestone
 */
export function getMasteryBadgeInfo(kind: 'member' | 'era', key: string, milestone: number) {
  const ms = MASTERY_MILESTONES.find(m => m.level === milestone)
  if (!ms) return null

  return {
    code: getMasteryBadgeCode(kind, key, milestone),
    rarity: ms.badge.rarity,
    description: ms.badge.description,
    isSpecial: milestone === 100 && kind === 'member' && ms.badge.isSpecialAtMax,
    milestone,
    kind,
    key
  }
}

