import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { InventoryItem } from '@/lib/models/InventoryItem'
import { mapPhotocardSummary } from '@/lib/game/photocardMapper'
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
    const q = (searchParams.get('q') || '').trim()
    const category = (searchParams.get('category') || '').trim() || null
    const subcategory = (searchParams.get('subcategory') || '').trim() || null
    const source = (searchParams.get('source') || '').trim() || null
    const newOnly = searchParams.get('newOnly') === '1'

    await connect()

    const hasFilters = !!q || !!category || !!subcategory || !!source || newOnly
    let mapped: Array<{ id: string; card: ReturnType<typeof mapPhotocardSummary>; acquiredAt: Date }> = []
    let count = 0

    if (!hasFilters) {
      const items = await InventoryItem.find({ userId: user.uid })
        .sort({ acquiredAt: -1 })
        .skip(Number.isFinite(skip) ? skip : 0)
        .limit(limit)
        .populate('cardId')
        .lean()

      mapped = items.map((it: any) => {
        const card = it.cardId
        return {
          id: it._id.toString(),
          card: mapPhotocardSummary(card),
          acquiredAt: it.acquiredAt,
          source: it.source
        }
      })

      count = await InventoryItem.countDocuments({ userId: user.uid })
    } else {
      const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = q ? new RegExp(escapeRegex(q), 'i') : null
      const itemMatch: any = { userId: user.uid }
      if (source) itemMatch['source.type'] = source
      if (newOnly) {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        itemMatch.acquiredAt = { $gte: since }
      }
      const cardMatch: any = {}
      if (category) cardMatch['card.categoryPath'] = category
      if (subcategory) cardMatch['card.subcategoryPath'] = subcategory
      if (regex) {
        cardMatch.$or = [
          { 'card.caption': regex },
          { 'card.imageName': regex },
          { 'card.imageKey': regex },
          { 'card.categoryDisplay': regex },
          { 'card.categoryPath': regex },
          { 'card.pageDisplay': regex },
          { 'card.subcategoryPath': regex },
          { 'card.subcategoryLabels': regex }
        ]
      }

      const agg = await InventoryItem.aggregate([
        { $match: itemMatch },
        {
          $lookup: {
            from: 'fandom_gallery_images',
            localField: 'cardId',
            foreignField: '_id',
            as: 'card'
          }
        },
        { $unwind: '$card' },
        { $match: cardMatch },
        { $sort: { acquiredAt: -1 } },
        {
          $facet: {
            items: [
              { $skip: Number.isFinite(skip) ? skip : 0 },
              { $limit: limit }
            ],
            total: [{ $count: 'count' }]
          }
        }
      ])

      const items = agg[0]?.items || []
      count = agg[0]?.total?.[0]?.count || 0
      mapped = items.map((it: any) => {
        const card = it.card
        return {
          id: it._id.toString(),
          card: mapPhotocardSummary(card),
          acquiredAt: it.acquiredAt,
          source: it.source
        }
      })
    }

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
