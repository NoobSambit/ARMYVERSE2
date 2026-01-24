export type BoraRushXpTier =
  | 'speedrun'
  | 'swift'
  | 'steady'
  | 'gritty'
  | 'survivor'
  | 'finish'

export type BoraRushXpResult = {
  turns: number
  xp: number
  tier: BoraRushXpTier
}

const XP_TIERS: Array<{ maxTurns: number; xp: number; tier: BoraRushXpTier }> = [
  { maxTurns: 20, xp: 200, tier: 'speedrun' },
  { maxTurns: 30, xp: 170, tier: 'swift' },
  { maxTurns: 40, xp: 140, tier: 'steady' },
  { maxTurns: 50, xp: 115, tier: 'gritty' },
  { maxTurns: 60, xp: 95, tier: 'survivor' },
  { maxTurns: 80, xp: 80, tier: 'survivor' },
  { maxTurns: Infinity, xp: 60, tier: 'finish' }
]

export function normalizeBoraRushTurns(turns: number): number {
  if (!Number.isFinite(turns)) return 0
  const floored = Math.floor(turns)
  return Math.min(200, Math.max(1, floored))
}

export function calculateBoraRushXp(turns: number): BoraRushXpResult {
  const normalized = normalizeBoraRushTurns(turns)
  for (const tier of XP_TIERS) {
    if (normalized <= tier.maxTurns) {
      return { turns: normalized, xp: tier.xp, tier: tier.tier }
    }
  }
  return { turns: normalized, xp: 60, tier: 'finish' }
}
