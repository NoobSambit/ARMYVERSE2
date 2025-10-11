import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { verifyFirebaseToken } from '@/lib/auth/verify'
import { Photocard, IPhotocard } from '@/lib/models/Photocard'
import { InventoryItem } from '@/lib/models/InventoryItem'
import { UserGameState, IUserGameState } from '@/lib/models/UserGameState'
import { rollRarityAndCardV2 } from '@/lib/game/dropTable'
import { InventoryGrantAudit } from '@/lib/models/InventoryGrantAudit'
import { url as cloudinaryUrl } from '@/lib/cloudinary'

export const runtime = 'nodejs'

/**
 * POST /api/game/craft
 * Body: { cardId?: string, targetRarity?: 'rare'|'epic'|'legendary' }
 */

const Schema = z.object({
  cardId: z.string().optional(),
  targetRarity: z.enum(['rare', 'epic', 'legendary']).optional()
}).refine((d) => d.cardId || d.targetRarity, { message: 'cardId or targetRarity is required' })

const DEFAULT_COSTS: Record<string, number> = { common: 20, rare: 60, epic: 200, legendary: 800 }

export async function POST(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()

    const body = await request.json().catch(() => ({}))
    const input = Schema.safeParse(body)
    if (!input.success) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

    const state = await UserGameState.findOne({ userId: user.uid })
    if (!state) await UserGameState.create({ userId: user.uid })

    let granted: IPhotocard | null = null
    let rarity: string | null = null
    let dustSpent = 0

    if (input.data.cardId) {
      const card = await Photocard.findById(input.data.cardId).lean() as IPhotocard | null
      if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 400 })
      const cost = card.craftCostDust ?? DEFAULT_COSTS[card.rarity]
      const st = await UserGameState.findOne({ userId: user.uid })
      if (!st || (st.dust || 0) < cost) return NextResponse.json({ error: 'Insufficient dust' }, { status: 400 })
      await UserGameState.updateOne({ userId: user.uid }, { $inc: { dust: -cost } })
      dustSpent = cost
      await InventoryItem.create({ userId: user.uid, cardId: card._id, acquiredAt: new Date(), source: { type: 'quiz' } })
      granted = card
      rarity = card.rarity
      await InventoryGrantAudit.create({ userId: user.uid, sessionId: undefined, cardId: card._id, rarity, seed: 'craft', poolSlug: '', reason: 'craft' })
    } else if (input.data.targetRarity) {
      const floor = input.data.targetRarity
      const cost = DEFAULT_COSTS[floor]
      const st = await UserGameState.findOne({ userId: user.uid })
      if (!st || (st.dust || 0) < cost) return NextResponse.json({ error: 'Insufficient dust' }, { status: 400 })
      await UserGameState.updateOne({ userId: user.uid }, { $inc: { dust: -cost } })
      dustSpent = cost
      const roll = await rollRarityAndCardV2({ userId: user.uid, ticketMinRarity: floor })
      granted = roll.card
      rarity = roll.rarity
      if (granted) {
        await InventoryItem.create({ userId: user.uid, cardId: granted._id, acquiredAt: new Date(), source: { type: 'quiz' } })
      }
    }

    if (!granted) return NextResponse.json({ error: 'No grant available' }, { status: 500 })

    const imageUrl = cloudinaryUrl(granted.publicId)
    const balances = await UserGameState.findOne({ userId: user.uid }).lean() as IUserGameState | null
    const inventoryCount = await InventoryItem.countDocuments({ userId: user.uid })

    return NextResponse.json({
      reward: {
        cardId: granted._id.toString(),
        rarity,
        member: granted.member,
        era: granted.era,
        set: granted.set,
        publicId: granted.publicId,
        imageUrl
      },
      balances: { dust: balances?.dust || 0, dustSpent },
      inventoryCount
    })
  } catch (error) {
    console.error('Craft error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


