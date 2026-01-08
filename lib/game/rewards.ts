import { UserGameState } from '@/lib/models/UserGameState'
import type { Rarity } from './dropTable'

export type BalanceAward = {
  dust?: number
  xp?: number
}

const DUPLICATE_DUST: Record<Rarity, number> = {
  common: 10,
  rare: 40,
  epic: 120,
  legendary: 400
}

export function duplicateDustForRarity(rarity: Rarity | null | undefined) {
  if (!rarity) return 0
  return DUPLICATE_DUST[rarity] || 0
}

type IncUpdate = {
  dust?: number
  xp?: number
}

export async function awardBalances(userId: string, award: BalanceAward) {
  const inc: IncUpdate = {}
  if (typeof award.dust === 'number' && award.dust !== 0) inc.dust = award.dust
  if (typeof award.xp === 'number' && award.xp !== 0) inc.xp = award.xp

  const update: { $setOnInsert: { dust: number }; $inc?: IncUpdate } = { $setOnInsert: { dust: 0 } }
  if (Object.keys(inc).length) update.$inc = inc

  const res = await UserGameState.findOneAndUpdate(
    { userId },
    update,
    { upsert: true, new: true }
  ).lean<{ dust?: number; xp?: number }>()

  return {
    dust: res?.dust || 0,
    xp: res?.xp || 0
  }
}
