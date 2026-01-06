import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth, getUserFromAuth } from '@/lib/auth/verify'
import { Photocard } from '@/lib/models/Photocard'
import { DropPool } from '@/lib/models/DropPool'

export const runtime = 'nodejs'

/**
 * GET /api/game/pools
 */

const DEFAULT_SET = 'BE Era'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connect()

    const total = await Photocard.estimatedDocumentCount()
    if (total === 0 && process.env.NODE_ENV === 'development') {
      console.warn('[dev-seed] Seeding demo Photocard documents...')
      await Photocard.insertMany([
        { member: 'Jimin', era: 'BE', set: DEFAULT_SET, rarity: 'common', publicId: 'armyverse/cards/be_jimin_01', attributes: [], isLimited: false },
        { member: 'Jungkook', era: 'BE', set: DEFAULT_SET, rarity: 'rare', publicId: 'armyverse/cards/be_jk_01', attributes: [], isLimited: false },
        { member: 'RM', era: 'BE', set: DEFAULT_SET, rarity: 'epic', publicId: 'armyverse/cards/be_rm_01', attributes: [], isLimited: false },
        { member: 'V', era: 'BE', set: DEFAULT_SET, rarity: 'legendary', publicId: 'armyverse/cards/be_v_01', attributes: [], isLimited: false }
      ])
    }

    // Try active DropPool
    const now = new Date()
    const pool: any = await DropPool.findOne({ active: true, 'window.start': { $lte: now }, 'window.end': { $gte: now } }).lean()
    if (pool) {
      return NextResponse.json({
        active: {
          slug: pool.slug,
          name: pool.name,
          window: pool.window,
          weights: pool.weights,
          featured: pool.featured
        }
      })
    }

    // Fallback to Phase 1 default
    const counts = await Photocard.aggregate([
      { $match: { set: DEFAULT_SET } },
      { $group: { _id: '$rarity', count: { $sum: 1 } } }
    ])
    const map: Record<string, number> = { common: 0, rare: 0, epic: 0, legendary: 0 }
    for (const c of counts) map[c._id] = c.count

    return NextResponse.json({
      active: {
        set: DEFAULT_SET,
        rarities: {
          common: map.common,
          rare: map.rare,
          epic: map.epic,
          legendary: map.legendary
        }
      }
    })
  } catch (error) {
    console.error('Pools error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


