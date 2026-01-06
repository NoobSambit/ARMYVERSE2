import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'
import { InventoryItem } from '@/lib/models/InventoryItem'
import { buildShareUrl } from '@/lib/cloudinaryShare'

export const runtime = 'nodejs'

/**
 * POST /api/game/share
 * Body: { inventoryItemId: string }
 */
const Schema = z.object({ inventoryItemId: z.string().min(8) })

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connect()

    const body = await request.json().catch(() => ({}))
    const input = Schema.safeParse(body)
    if (!input.success) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

    const item = await InventoryItem.findOne({ _id: input.data.inventoryItemId, userId: user.uid }).populate('cardId')
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const card: any = (item as any).cardId
    const text = `${card.member} • ${card.rarity.toUpperCase()} • @${user.displayName || user.username || 'user'}`
    const shareUrl = buildShareUrl({ publicId: card.publicId, text })
    return NextResponse.json({ shareUrl })
  } catch (error) {
    console.error('Share error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


