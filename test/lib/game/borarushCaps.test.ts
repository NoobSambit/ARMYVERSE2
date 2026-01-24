import { applyBoraRushDailyCaps } from '@/lib/game/borarush'

describe('applyBoraRushDailyCaps', () => {
  it('awards XP and card when under caps', () => {
    const result = applyBoraRushDailyCaps({
      xp: 120,
      xpAwardsToday: 0,
      cardAwardsToday: 3,
      xpLimit: 2,
      cardLimit: 10
    })

    expect(result).toEqual({
      xpAwarded: 120,
      xpCapped: false,
      cardCapped: false
    })
  })

  it('caps XP when daily XP limit is reached', () => {
    const result = applyBoraRushDailyCaps({
      xp: 140,
      xpAwardsToday: 2,
      cardAwardsToday: 1,
      xpLimit: 2,
      cardLimit: 10
    })

    expect(result.xpAwarded).toBe(0)
    expect(result.xpCapped).toBe(true)
    expect(result.cardCapped).toBe(false)
  })

  it('caps cards when daily card limit is reached', () => {
    const result = applyBoraRushDailyCaps({
      xp: 95,
      xpAwardsToday: 1,
      cardAwardsToday: 10,
      xpLimit: 2,
      cardLimit: 10
    })

    expect(result.xpAwarded).toBe(95)
    expect(result.xpCapped).toBe(false)
    expect(result.cardCapped).toBe(true)
  })

  it('caps XP and cards when both limits are reached', () => {
    const result = applyBoraRushDailyCaps({
      xp: 200,
      xpAwardsToday: 3,
      cardAwardsToday: 12,
      xpLimit: 2,
      cardLimit: 10
    })

    expect(result).toEqual({
      xpAwarded: 0,
      xpCapped: true,
      cardCapped: true
    })
  })
})
