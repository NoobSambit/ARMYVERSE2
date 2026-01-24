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

export const runtime = 'nodejs'

const AwardSchema = z.object({
  runId: z.string().min(8),
  turns: z.number().int().min(1).max(200),
  playerCount: z.number().int().min(1).max(2).optional(),
  winnerId: z.number().int().min(1).max(2).optional()
})

const BORARUSH_ORIGIN = process.env.BORARUSH_ORIGIN || 'https://borarush.netlify.app'
const BORARUSH_ORIGIN_DEV = process.env.BORARUSH_ORIGIN_DEV || ''

const allowedOrigins = new Set(
  [BORARUSH_ORIGIN, BORARUSH_ORIGIN_DEV].filter(Boolean)
)

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

    let balances = await awardBalances(handoff.sub, { xp: xpResult.xp }, {
      activityAt,
      leaderboardProfile: {
        displayName: handoff.displayName || handoff.username || 'Player',
        avatarUrl: handoff.photoURL || ''
      }
    })

    let reward = null
    let duplicateCard = false
    let dustAwarded = 0
    let cardId = undefined as any

    const cardAgg = await Photocard.aggregate([{ $sample: { size: 1 } }])
    const card = cardAgg[0] || null
    if (card) {
      cardId = card._id
      await InventoryGrantAudit.create({
        userId: handoff.sub,
        sessionId: undefined,
        cardId: card._id,
        rarity: 'random',
        seed: input.data.runId,
        poolSlug: '',
        reason: 'borarush',
        anomaly: false,
        xp: xpResult.xp
      })

      const existingOwned = await InventoryItem.findOne({ userId: handoff.sub, cardId: card._id })
      if (existingOwned) {
        duplicateCard = true
        dustAwarded = duplicateDustForRarity('random')
        balances = await awardBalances(handoff.sub, { dust: dustAwarded })
      } else {
        await InventoryItem.create({
          userId: handoff.sub,
          cardId: card._id,
          acquiredAt: activityAt,
          source: { type: 'borarush' }
        })
      }
      reward = { ...mapPhotocardSummary(card), rarity: 'random' }
    }

    await BoraRushRun.create({
      userId: handoff.sub,
      runId: input.data.runId,
      turns: xpResult.turns,
      xpAwarded: xpResult.xp,
      cardId,
      duplicate: duplicateCard,
      dustAwarded,
      playerCount,
      winnerId: input.data.winnerId || 1,
      completedAt: activityAt
    })

    return NextResponse.json({
      ok: true,
      duplicate: false,
      runDuplicate: false,
      runId: input.data.runId,
      turns: xpResult.turns,
      xpAwarded: xpResult.xp,
      tier: xpResult.tier,
      reward,
      duplicateCard,
      dustAwarded,
      balances
    }, { headers: getCorsHeaders(request.headers.get('origin')) })
  } catch (error) {
    console.error('BoraRush award error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: getCorsHeaders(request.headers.get('origin')) })
  }
}
