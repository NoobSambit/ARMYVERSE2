import { UserGameState } from '@/lib/models/UserGameState'
import type { Rarity } from './dropTable'

export type BalanceAward = {
  dust?: number
  xp?: number
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

export async function awardBalances(userId: string, award: BalanceAward) {
  const inc: IncUpdate = {}
  if (typeof award.dust === 'number' && award.dust !== 0) inc.dust = award.dust
  if (typeof award.xp === 'number' && award.xp !== 0) inc.xp = award.xp

  const update: { $setOnInsert?: IncUpdate; $inc?: IncUpdate } = {}
  if (Object.keys(inc).length) update.$inc = inc

  const setOnInsert: IncUpdate = {}
  if (!('dust' in inc)) setOnInsert.dust = 0
  if (!('xp' in inc)) setOnInsert.xp = 0
  if (Object.keys(setOnInsert).length) update.$setOnInsert = setOnInsert

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
