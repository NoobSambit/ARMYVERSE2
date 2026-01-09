import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Photocard } from '@/lib/models/Photocard'
import { mapPhotocardSummary } from '@/lib/game/photocardMapper'

export const runtime = 'nodejs'

/**
 * GET /api/game/photocards/preview
 * 
 * Public endpoint to fetch sample photocards for the landing page
 * Returns a random sample to showcase the game's photocard collection
 */
export async function GET() {
  try {
    await connect()

    const sample = await Photocard.aggregate([
      { $sample: { size: 12 } }
    ])

    const cards = sample
      .map((card: any) => mapPhotocardSummary(card))
      .filter(Boolean)

    return NextResponse.json({
      cards,
      total: cards.length
    })
  } catch (error) {
    console.error('Preview photocards fetch error:', error)
    // Return empty array on error to prevent breaking the landing page
    return NextResponse.json({ cards: [], total: 0 })
  }
}
