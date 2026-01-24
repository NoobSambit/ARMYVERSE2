import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { awardBalances, duplicateDustForRarity } from '@/lib/game/rewards'
import { calculateBoraRushXp } from '@/lib/game/borarush'
import { BoraRushRun, type IBoraRushRun } from '@/lib/models/BoraRushRun'
import { verifyBoraRushHandoff } from '@/lib/auth/gameHandoff'
import { Photocard } from '@/lib/models/Photocard'
import { InventoryItem } from '@/lib/models/InventoryItem'
import { InventoryGrantAudit } from '@/lib/models/InventoryGrantAudit'
import { mapPhotocardSummary, type PhotocardDoc } from '@/lib/game/photocardMapper'
import { BoraRushDailyLimit } from '@/lib/models/BoraRushDailyLimit'

export const runtime = 'nodejs'

const AwardSchema = z.object({
  runId: z.string().min(8),
  turns: z.number().int().min(1).max(200),
  playerCount: z.number().int().min(1).max(2).optional(),
  winnerId: z.number().int().min(1).max(2).optional()
})

const BORARUSH_ORIGIN = process.env.BORARUSH_ORIGIN || 'https://borarush.netlify.app'
const BORARUSH_ORIGIN_DEV = process.env.BORARUSH_ORIGIN_DEV || ''
const BORARUSH_DAILY_XP_CAP = 2
const BORARUSH_DAILY_CARD_CAP = 10

const allowedOrigins = new Set(
  [BORARUSH_ORIGIN, BORARUSH_ORIGIN_DEV].filter(Boolean)
)

type DailyCounterField = 'xpAwards' | 'cardAwards'

function getUtcDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

async function ensureDailyLimitDoc(userId: string, dateKey: string) {
  try {
    await BoraRushDailyLimit.updateOne(
      { userId, dateKey },
      {
        $setOnInsert: {
          userId,
          dateKey,
          xpAwards: 0,
          cardAwards: 0
        }
      },
      { upsert: true }
    )
  } catch (error: any) {
    if (error?.code !== 11000) {
      throw error
    }
  }
}

async function reserveDailyAward(userId: string, dateKey: string, field: DailyCounterField, limit: number) {
  if (limit <= 0) return false
  const updated = await BoraRushDailyLimit.findOneAndUpdate(
    { userId, dateKey, [field]: { $lt: limit } },
    { $inc: { [field]: 1 } },
    { new: true }
  ).lean()
  return !!updated
}

function getCorsHeaders(origin: string | null) {
  const resolvedOrigin = origin && allowedOrigins.has(origin) ? origin : BORARUSH_ORIGIN
  return {
    'Access-Control-Allow-Origin': resolvedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin'
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin'))
  })
}

export async function POST(request: NextRequest) {
  let userId = ''
  let dateKey = ''
  let xpReserved = false
  let cardReserved = false
  let xpAwardApplied = false
  let cardAwardApplied = false
  let runRecorded = false

  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders(request.headers.get('origin')) })
    }

    const token = authHeader.split('Bearer ')[1]
    const handoff = verifyBoraRushHandoff(token)
    if (!handoff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders(request.headers.get('origin')) })
    }
    userId = handoff.sub

    const body = await request.json().catch(() => ({}))
    const input = AwardSchema.safeParse(body)
    if (!input.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400, headers: getCorsHeaders(request.headers.get('origin')) })
    }

    await connect()

    const existing = await BoraRushRun.findOne({ runId: input.data.runId }).lean<IBoraRushRun | null>()
    if (existing) {
      if (existing.userId !== handoff.sub) {
        return NextResponse.json({ error: 'Run already claimed' }, { status: 409, headers: getCorsHeaders(request.headers.get('origin')) })
      }
      let reward = null
      if (existing.cardId) {
        const card = await Photocard.findById(existing.cardId).lean<PhotocardDoc | null>()
        reward = card ? { ...mapPhotocardSummary(card), rarity: 'random' } : null
      }
      return NextResponse.json({
        ok: true,
        duplicate: true,
        runDuplicate: true,
        runId: input.data.runId,
        turns: existing.turns,
        xpAwarded: existing.xpAwarded,
        reward,
        duplicateCard: existing.duplicate || false,
        dustAwarded: existing.dustAwarded || 0
      }, { headers: getCorsHeaders(request.headers.get('origin')) })
    }

    const playerCount = input.data.playerCount || 1
    if (playerCount > 1) {
      return NextResponse.json(
        { error: 'XP is only awarded for Solo Run mode' },
        { status: 400, headers: getCorsHeaders(request.headers.get('origin')) }
      )
    }

    const xpResult = calculateBoraRushXp(input.data.turns)
    const activityAt = new Date()
    dateKey = getUtcDateKey(activityAt)

    await ensureDailyLimitDoc(userId, dateKey)
    xpReserved = await reserveDailyAward(userId, dateKey, 'xpAwards', BORARUSH_DAILY_XP_CAP)

    const xpCapped = !xpReserved
    const xpAwarded = xpReserved ? xpResult.xp : 0

    let balances = null as any
    if (xpAwarded > 0) {
      balances = await awardBalances(userId, { xp: xpAwarded }, {
        activityAt,
        leaderboardProfile: {
          displayName: handoff.displayName || handoff.username || 'Player',
          avatarUrl: handoff.photoURL || ''
        }
      })
      xpAwardApplied = true
    }

    let reward = null
    let duplicateCard = false
    let dustAwarded = 0
    let cardId = undefined as any
    let cardCapped = false

    const cardAgg = await Photocard.aggregate([{ $sample: { size: 1 } }])
    const card = cardAgg[0] || null
    if (card) {
      cardReserved = await reserveDailyAward(userId, dateKey, 'cardAwards', BORARUSH_DAILY_CARD_CAP)
      cardCapped = !cardReserved

      if (cardReserved) {
        cardId = card._id
        await InventoryGrantAudit.create({
          userId,
          sessionId: undefined,
          cardId: card._id,
          rarity: 'random',
          seed: input.data.runId,
          poolSlug: '',
          reason: 'borarush',
          anomaly: false,
          xp: xpAwarded
        })

        const existingOwned = await InventoryItem.findOne({ userId, cardId: card._id })
        if (existingOwned) {
          duplicateCard = true
          dustAwarded = duplicateDustForRarity('random')
          balances = await awardBalances(userId, { dust: dustAwarded })
        } else {
          await InventoryItem.create({
            userId,
            cardId: card._id,
            acquiredAt: activityAt,
            source: { type: 'borarush' }
          })
        }
        reward = { ...mapPhotocardSummary(card), rarity: 'random' }
        cardAwardApplied = true
      }
    }

    await BoraRushRun.create({
      userId,
      runId: input.data.runId,
      turns: xpResult.turns,
      xpAwarded,
      cardId,
      duplicate: duplicateCard,
      dustAwarded,
      playerCount,
      winnerId: input.data.winnerId || 1,
      completedAt: activityAt
    })
    runRecorded = true

    return NextResponse.json({
      ok: true,
      duplicate: false,
      runDuplicate: false,
      runId: input.data.runId,
      turns: xpResult.turns,
      xpAwarded,
      tier: xpResult.tier,
      reward,
      duplicateCard,
      dustAwarded,
      xpCapped,
      cardCapped,
      xpDailyLimit: BORARUSH_DAILY_XP_CAP,
      cardDailyLimit: BORARUSH_DAILY_CARD_CAP,
      balances
    }, { headers: getCorsHeaders(request.headers.get('origin')) })
  } catch (error) {
    if (!runRecorded && userId && dateKey && (xpReserved || cardReserved)) {
      try {
        const rollbackOps: Array<Promise<unknown>> = []
        if (xpReserved && !xpAwardApplied) {
          rollbackOps.push(
            BoraRushDailyLimit.updateOne(
              { userId, dateKey, xpAwards: { $gt: 0 } },
              { $inc: { xpAwards: -1 } }
            )
          )
        }
        if (cardReserved && !cardAwardApplied) {
          rollbackOps.push(
            BoraRushDailyLimit.updateOne(
              { userId, dateKey, cardAwards: { $gt: 0 } },
              { $inc: { cardAwards: -1 } }
            )
          )
        }
        if (rollbackOps.length) {
          await Promise.all(rollbackOps)
        }
      } catch (rollbackError) {
        console.error('BoraRush cap rollback error:', rollbackError)
      }
    }
    console.error('BoraRush award error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: getCorsHeaders(request.headers.get('origin')) })
  }
}
