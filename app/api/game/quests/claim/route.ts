import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { verifyFirebaseToken } from '@/lib/auth/verify'
import { QuestDefinition } from '@/lib/models/QuestDefinition'
import { UserQuestProgress } from '@/lib/models/UserQuestProgress'
import { dailyKey, weeklyKey } from '@/lib/game/quests'
import { UserGameState } from '@/lib/models/UserGameState'
import { rollRarityAndCardV2 } from '@/lib/game/dropTable'
import { InventoryItem } from '@/lib/models/InventoryItem'
import { url as cloudinaryUrl } from '@/lib/cloudinary'

export const runtime = 'nodejs'

/**
 * POST /api/game/quests/claim
 * Body: { code: string }
 */
const Schema = z.object({ code: z.string().min(1) })

export async function POST(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()

    const body = await request.json().catch(() => ({}))
    const input = Schema.safeParse(body)
    if (!input.success) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

    const def = await QuestDefinition.findOne({ code: input.data.code }).lean()
    if (!def) return NextResponse.json({ error: 'Quest not found' }, { status: 400 })

    const key = def.period === 'daily' ? dailyKey() : weeklyKey()
    const prog = await UserQuestProgress.findOne({ userId: user.uid, code: def.code, periodKey: key })
    if (!prog || (prog.progress || 0) < def.goalValue) return NextResponse.json({ error: 'Not completed' }, { status: 400 })
    if (prog.claimed) return NextResponse.json({ error: 'Already claimed' }, { status: 409 })

    let reward: any = null
    if (def.reward?.dust) {
      await UserGameState.findOneAndUpdate({ userId: user.uid }, { $inc: { dust: def.reward.dust } }, { upsert: true })
    }
    if (def.reward?.ticket?.rarityMin) {
      const roll = await rollRarityAndCardV2({ userId: user.uid, ticketMinRarity: def.reward.ticket.rarityMin as any })
      if (roll.card) {
        await InventoryItem.create({ userId: user.uid, cardId: roll.card._id, acquiredAt: new Date(), source: { type: 'quiz' } })
        reward = {
          cardId: roll.card._id.toString(),
          rarity: roll.rarity,
          member: roll.card.member,
          era: roll.card.era,
          set: roll.card.set,
          publicId: roll.card.publicId,
          imageUrl: cloudinaryUrl(roll.card.publicId)
        }
      }
    }

    prog.claimed = true
    prog.completed = true
    await prog.save()

    const state = await UserGameState.findOne({ userId: user.uid }).lean()

    return NextResponse.json({ reward, balances: { dust: state?.dust || 0 } })
  } catch (error) {
    console.error('Quests claim error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


