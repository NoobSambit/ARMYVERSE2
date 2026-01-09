import { Photocard } from '@/lib/models/Photocard'
import { UserGameState } from '@/lib/models/UserGameState'
import { InventoryGrantAudit } from '@/lib/models/InventoryGrantAudit'

export type Rarity = 'random'

export type RollOptions = {
  userId: string
  seed?: string
}

type LeanPhotocard = {
  _id: any
  categoryPath?: string
  categoryDisplay?: string
  subcategoryPath?: string | null
  subcategoryLabels?: string[]
  imageUrl: string
  thumbUrl?: string
  caption?: string
  sourceUrl?: string
  pageUrl?: string
  pageTitle?: string
  imageName?: string
  imageKey?: string
}

export async function rollRarityAndCardV2(opts: RollOptions): Promise<{ rarity: Rarity; card: LeanPhotocard | null; poolSlug: string }> {
  const { userId } = opts
  let state = await UserGameState.findOne({ userId })
  if (!state) await UserGameState.create({ userId })

  const cardAgg = await Photocard.aggregate<LeanPhotocard>([
    { $sample: { size: 1 } }
  ])
  const card = cardAgg[0] || null
  const rarity: Rarity = 'random'

  if (card) {
    await InventoryGrantAudit.create({
      userId,
      sessionId: undefined,
      cardId: card._id,
      rarity,
      seed: opts.seed || Math.random().toString(36).slice(2),
      poolSlug: '',
      reason: 'quiz',
      anomaly: false
    })
  }

  return { rarity, card, poolSlug: '' }
}

export async function rollQuizRarityAndCardByXp(
  userId: string,
  xp: number
): Promise<{ rarity: Rarity | null; card: LeanPhotocard | null; rarityWeightsUsed: null; pityApplied: false }> {
  if (xp < 5) {
    return { rarity: null, card: null, rarityWeightsUsed: null, pityApplied: false }
  }

  let state = await UserGameState.findOne({ userId })
  if (!state) await UserGameState.create({ userId })

  const cardAgg = await Photocard.aggregate<LeanPhotocard>([
    { $sample: { size: 1 } }
  ])
  const card = cardAgg[0] || null

  if (card) {
    await InventoryGrantAudit.create({
      userId,
      sessionId: undefined,
      cardId: card._id,
      rarity: 'random',
      seed: Math.random().toString(36).slice(2),
      poolSlug: '',
      reason: 'quiz',
      anomaly: false,
      xp
    })
  }

  return { rarity: 'random', card, rarityWeightsUsed: null, pityApplied: false }
}
