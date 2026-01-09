import { NextRequest, NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { verifyAuth } from '@/lib/auth/verify'
import { Photocard } from '@/lib/models/Photocard'

export const runtime = 'nodejs'

/**
 * GET /api/game/pools
 */

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connect()

    const total = await Photocard.estimatedDocumentCount()
    const categoryCount = (await Photocard.distinct('categoryPath')).length

    return NextResponse.json({
      active: {
        name: 'Fandom Gallery Pool',
        totalCards: total,
        categories: categoryCount
      }
    })
  } catch (error) {
    console.error('Pools error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
