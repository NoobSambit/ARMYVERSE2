import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { InventoryItem } from '@/lib/models/InventoryItem'
import { url as cloudinaryUrl } from '@/lib/cloudinary'
// Ensure Photocard schema is registered before populate()
import '@/lib/models/Photocard'

export const runtime = 'nodejs'

/**
 * GET /api/game/inventory
 *
 * curl example:
 * curl -X GET 'http://localhost:3000/api/game/inventory?skip=0&limit=20' \
 *  -H 'Authorization: Bearer <FIREBASE_ID_TOKEN>'
 */

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get('skip') || '0', 10)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    await connect()

    const items = await InventoryItem.find({ userId: user.uid })
      .sort({ acquiredAt: -1 })
      .skip(Number.isFinite(skip) ? skip : 0)
      .limit(limit)
      .populate('cardId')
      .lean()

    const mapped = items.map((it: any) => {
      const card = it.cardId
      return {
        id: it._id.toString(),
        card: card ? {
          member: card.member,
          era: card.era,
          set: card.set,
          rarity: card.rarity,
          publicId: card.publicId,
          imageUrl: cloudinaryUrl(card.publicId)
        } : null,
        acquiredAt: it.acquiredAt
      }
    })

    const count = await InventoryItem.countDocuments({ userId: user.uid })
    const nextCursor = skip + limit < count ? String(skip + limit) : undefined

    return NextResponse.json({ 
      items: mapped, 
      total: count,
      ...(nextCursor ? { nextCursor } : {}) 
    })
  } catch (error) {
    console.error('Inventory error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

