import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { Photocard, IPhotocard } from '@/lib/models/Photocard'
import { InventoryItem } from '@/lib/models/InventoryItem'
import { UserGameState, IUserGameState } from '@/lib/models/UserGameState'
import { rollRarityAndCardV2 } from '@/lib/game/dropTable'
import { InventoryGrantAudit } from '@/lib/models/InventoryGrantAudit'
import { mapPhotocardSummary, type PhotocardDoc } from '@/lib/game/photocardMapper'

export const runtime = 'nodejs'

/**
 * POST /api/game/craft
 * Body: { cardId?: string }
 */

const Schema = z.object({
  cardId: z.string().optional()
})

const DEFAULT_COST = 50

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()

    const body = await request.json().catch(() => ({}))
    const input = Schema.safeParse(body)
    if (!input.success) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

    const state = await UserGameState.findOne({ userId: user.uid })
    if (!state) await UserGameState.create({ userId: user.uid })

    let granted: PhotocardDoc | null = null
    let rarity: string | null = null
    let dustSpent = 0

    if (input.data.cardId) {
      const card = await Photocard.findById(input.data.cardId).lean() as IPhotocard | null
      if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 400 })
      const cost = DEFAULT_COST
      const st = await UserGameState.findOne({ userId: user.uid })
      if (!st || (st.dust || 0) < cost) return NextResponse.json({ error: 'Insufficient dust' }, { status: 400 })
      await UserGameState.updateOne({ userId: user.uid }, { $inc: { dust: -cost } })
      dustSpent = cost
      await InventoryItem.create({ userId: user.uid, cardId: card._id, acquiredAt: new Date(), source: { type: 'craft' } })
      granted = card
      rarity = 'random'
      await InventoryGrantAudit.create({ userId: user.uid, sessionId: undefined, cardId: card._id, rarity, seed: 'craft', poolSlug: '', reason: 'craft' })
    } else {
      const st = await UserGameState.findOne({ userId: user.uid })
      if (!st || (st.dust || 0) < DEFAULT_COST) return NextResponse.json({ error: 'Insufficient dust' }, { status: 400 })
      await UserGameState.updateOne({ userId: user.uid }, { $inc: { dust: -DEFAULT_COST } })
      dustSpent = DEFAULT_COST
      const roll = await rollRarityAndCardV2({ userId: user.uid })
      granted = roll.card
      rarity = roll.rarity
      if (granted) {
        await InventoryItem.create({ userId: user.uid, cardId: granted._id, acquiredAt: new Date(), source: { type: 'craft' } })
      }
    }

    if (!granted) return NextResponse.json({ error: 'No grant available' }, { status: 500 })

    const summary = mapPhotocardSummary(granted)
    const balances = await UserGameState.findOne({ userId: user.uid }).lean() as IUserGameState | null
    const inventoryCount = await InventoryItem.countDocuments({ userId: user.uid })

    return NextResponse.json({
      reward: {
        ...summary,
        rarity
      },
      balances: { dust: balances?.dust || 0, dustSpent },
      inventoryCount
    })
  } catch (error) {
    console.error('Craft error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
