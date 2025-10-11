import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { verifyFirebaseToken } from '@/lib/auth/verify'
import { MasteryProgress } from '@/lib/models/MasteryProgress'
import { rollRarityAndCardV2 } from '@/lib/game/dropTable'
import { InventoryItem } from '@/lib/models/InventoryItem'
import { url as cloudinaryUrl } from '@/lib/cloudinary'

export const runtime = 'nodejs'

/**
 * POST /api/game/mastery/claim
 * Body: { kind: 'member'|'era', key: string }
 */
const Schema = z.object({ kind: z.enum(['member', 'era']), key: z.string().min(1) })

export async function POST(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()

    const body = await request.json().catch(() => ({}))
    const input = Schema.safeParse(body)
    if (!input.success) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

    const prog = await MasteryProgress.findOne({ userId: user.uid, kind: input.data.kind, key: input.data.key })
    if (!prog) return NextResponse.json({ error: 'Not eligible' }, { status: 400 })
    const level = Math.floor((prog.xp || 0) / 100)
    // Milestones at 5/10/20 etc. For simplicity, allow one claim per milestone level stored in 'level' field
    if ((prog.level || 0) >= level) return NextResponse.json({ error: 'Already claimed' }, { status: 409 })

    // Grant themed guaranteed pull
    const roll = await rollRarityAndCardV2({ userId: user.uid, ticketMinRarity: 'rare', featuredConstraint: input.data.kind === 'member' ? { members: [input.data.key] } : { set: input.data.key } })
    if (!roll.card) return NextResponse.json({ error: 'No cards available' }, { status: 500 })

    await InventoryItem.create({ userId: user.uid, cardId: roll.card._id, acquiredAt: new Date(), source: { type: 'quiz' } })
    prog.level = level
    await prog.save()

    return NextResponse.json({
      reward: {
        cardId: roll.card._id.toString(),
        rarity: roll.rarity,
        member: roll.card.member,
        era: roll.card.era,
        set: roll.card.set,
        publicId: roll.card.publicId,
        imageUrl: cloudinaryUrl(roll.card.publicId)
      }
    })
  } catch (error) {
    console.error('Mastery claim error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


