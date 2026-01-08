import { Photocard } from '@/lib/models/Photocard'
import { UserGameState } from '@/lib/models/UserGameState'
import { InventoryGrantAudit } from '@/lib/models/InventoryGrantAudit'
import { DropPool } from '@/lib/models/DropPool'

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

const DEFAULT_BASE_RATES: Record<Rarity, number> = {
  common: 70,
  rare: 22,
  epic: 7,
  legendary: 1
}

const PITY_THRESHOLDS = {
  epic: 15,
  legendary: 50
}

export type RollOptions = {
  userId: string
  poolSlug?: string
  ticketMinRarity?: Rarity
  featuredConstraint?: { set?: string; members?: string[] }
  seed?: string
}

type ActivePool = {
  slug: string
  weights: Record<Rarity, number>
  featured?: { set?: string; members?: string[]; rarityBoost?: { epic?: number; legendary?: number } }
}

type LeanPhotocard = {
  _id: any
  rarity: Rarity
  set?: string
  member?: string
  era?: string
  publicId: string
}

export async function getActivePool(): Promise<null | { slug: string; weights: Record<Rarity, number>; featured?: { set?: string; members?: string[]; rarityBoost?: { epic?: number; legendary?: number } } }> {
  const now = new Date()
  const pool = await DropPool.findOne({ active: true, 'window.start': { $lte: now }, 'window.end': { $gte: now } }).lean<ActivePool>()
  if (!pool) return null
  return {
    slug: pool.slug,
    weights: pool.weights,
    featured: pool.featured
  }
}

export async function rollRarityAndCardV2(opts: RollOptions): Promise<{ rarity: Rarity; card: any; poolSlug: string }> {
  const { userId, poolSlug, ticketMinRarity, featuredConstraint } = opts

  let state = await UserGameState.findOne({ userId })
  if (!state) state = await UserGameState.create({ userId })

  const activePool: ActivePool | null = poolSlug
    ? await DropPool.findOne({ slug: poolSlug }).lean<ActivePool>()
    : await DropPool.findOne({ active: true, 'window.start': { $lte: new Date() }, 'window.end': { $gte: new Date() } }).lean<ActivePool>()

  const baseWeights: Record<Rarity, number> = activePool ? activePool.weights : DEFAULT_BASE_RATES
  const boosts = activePool?.featured?.rarityBoost || {}

  // Apply pity and ticket floor
  const rarityOrder: Rarity[] = ['common', 'rare', 'epic', 'legendary']
  const pityForced = state.pity.sinceLegendary >= PITY_THRESHOLDS.legendary
    ? 'legendary'
    : (state.pity.sinceEpic >= PITY_THRESHOLDS.epic ? 'epic' : null)

  const minFloor = ticketMinRarity || (pityForced as Rarity | undefined)

  const weights = { ...baseWeights }
  if (boosts.epic) weights.epic = Math.max(0, (weights.epic || 0) + boosts.epic)
  if (boosts.legendary) weights.legendary = Math.max(0, (weights.legendary || 0) + boosts.legendary)
  if (minFloor) {
    // Zero-out weights below the floor
    for (const r of rarityOrder) {
      if (rarityOrder.indexOf(r) < rarityOrder.indexOf(minFloor)) weights[r] = 0
    }
  }

  const rarity = pityForced || weightedRandom(weights)

  // Update pity
  if (rarity === 'legendary') {
    state.pity.sinceLegendary = 0
    state.pity.sinceEpic = 0
  } else if (rarity === 'epic') {
    state.pity.sinceEpic = 0
    state.pity.sinceLegendary += 1
  } else {
    state.pity.sinceEpic += 1
    state.pity.sinceLegendary += 1
  }
  await state.save()

  // Build card match
  const match: Record<string, unknown> = { rarity }
  if (featuredConstraint?.set) match.set = featuredConstraint.set
  if (featuredConstraint?.members && featuredConstraint.members.length) match.member = { $in: featuredConstraint.members }

  const cardAgg = await Photocard.aggregate<LeanPhotocard>([
    { $match: match },
    { $sample: { size: 1 } }
  ])
  const card = cardAgg[0] || null

  // Audit
  const seed = opts.seed || Math.random().toString(36).slice(2)
  if (card) {
    await InventoryGrantAudit.create({
      userId,
      sessionId: undefined,
      cardId: card._id,
      rarity,
      seed,
      poolSlug: activePool?.slug || '',
      reason: 'quiz',
      anomaly: false
    })
  }

  return { rarity, card, poolSlug: activePool?.slug || '' }
}

function weightedRandom(weights: Record<Rarity, number>): Rarity {
  const entries = Object.entries(weights) as [Rarity, number][]
  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  if (total <= 0) return 'common'
  const r = Math.random() * total
  let acc = 0
  for (const [key, w] of entries) {
    acc += w
    if (r < acc) return key
  }
  return 'common'
}

// --- XP band odds for quiz rewards ---
export function weightsForXpBand(xp: number): Record<Rarity, number> {
  if (xp < 5) return { common: 0, rare: 0, epic: 0, legendary: 0 }
  if (xp <= 9) return { common: 60, rare: 30, epic: 10, legendary: 0 }
  if (xp <= 14) return { common: 40, rare: 45, epic: 15, legendary: 0 }
  if (xp <= 19) return { common: 20, rare: 45, epic: 30, legendary: 5 }
  if (xp <= 24) return { common: 10, rare: 35, epic: 40, legendary: 15 }
  // 25–30 (and above) treated as top band
  return { common: 0, rare: 30, epic: 45, legendary: 25 }
}

export async function rollQuizRarityAndCardByXp(userId: string, xp: number): Promise<{ rarity: Rarity | null; card: LeanPhotocard | null; rarityWeightsUsed: Record<Rarity, number> | null; pityApplied: boolean }>{
  const weights = weightsForXpBand(xp)
  const total = Object.values(weights).reduce((s, v) => s + v, 0)
  if (total <= 0) {
    return { rarity: null, card: null, rarityWeightsUsed: null, pityApplied: false }
  }

  // Load pity state
  let state = await UserGameState.findOne({ userId })
  if (!state) state = await UserGameState.create({ userId })

  // Base rarity roll by band
  let rarity: Rarity = weightedRandom(weights)

  // Apply pity AFTER band selection
  let pityApplied = false
  const pityForced = state.pity.sinceLegendary >= PITY_THRESHOLDS.legendary
    ? 'legendary'
    : (state.pity.sinceEpic >= PITY_THRESHOLDS.epic ? 'epic' : null)
  if (pityForced) {
    pityApplied = true
    rarity = pityForced
  }

  // Update pity counters based on final rarity
  if (rarity === 'legendary') {
    state.pity.sinceLegendary = 0
    state.pity.sinceEpic = 0
  } else if (rarity === 'epic') {
    state.pity.sinceEpic = 0
    state.pity.sinceLegendary += 1
  } else {
    state.pity.sinceEpic += 1
    state.pity.sinceLegendary += 1
  }
  await state.save()

  // Sample globally by rarity — no era/set/pool constraints
  const cardAgg = await Photocard.aggregate<LeanPhotocard>([
    { $match: { rarity } },
    { $sample: { size: 1 } }
  ])
  const card = cardAgg[0] || null

  // Audit (non-breaking), store xp if schema allows
  if (card) {
    try {
      await InventoryGrantAudit.create({
        userId,
        sessionId: undefined,
        cardId: card._id,
        rarity,
        seed: Math.random().toString(36).slice(2),
        poolSlug: '',
        reason: 'quiz',
        anomaly: false,
        // xp field optional; if schema is strict without xp it will be omitted
        xp
      } as unknown)
    } catch {}
  }

  return { rarity, card, rarityWeightsUsed: weights, pityApplied }
}
