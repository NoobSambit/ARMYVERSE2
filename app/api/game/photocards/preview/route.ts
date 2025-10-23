import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Photocard } from '@/lib/models/Photocard'
import { url as cloudinaryUrl } from '@/lib/cloudinary'

export const runtime = 'nodejs'

/**
 * GET /api/game/photocards/preview
 * 
 * Public endpoint to fetch sample photocards for the landing page
 * Returns a mix of rarities to showcase the game's photocard collection
 */
export async function GET() {
  try {
    await connect()

    // Fetch a diverse sample of photocards across all rarities
    const [legendary, epic, rare, common] = await Promise.all([
      Photocard.find({ rarity: 'legendary' }).limit(3).lean(),
      Photocard.find({ rarity: 'epic' }).limit(4).lean(),
      Photocard.find({ rarity: 'rare' }).limit(5).lean(),
      Photocard.find({ rarity: 'common' }).limit(6).lean()
    ])

    // Combine and format the cards
    const allCards = [...legendary, ...epic, ...rare, ...common].map(card => ({
      publicId: card.publicId,
      member: card.member,
      era: card.era,
      set: card.set,
      rarity: card.rarity,
      imageUrl: cloudinaryUrl(card.publicId, { width: 320, height: 448, crop: 'fill' }),
      isLimited: card.isLimited || false
    }))

    return NextResponse.json({
      cards: allCards,
      total: allCards.length
    })
  } catch (error) {
    console.error('Preview photocards fetch error:', error)
    // Return empty array on error to prevent breaking the landing page
    return NextResponse.json({ cards: [], total: 0 })
  }
}
