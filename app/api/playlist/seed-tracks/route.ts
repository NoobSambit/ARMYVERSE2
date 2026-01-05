import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Track } from '@/lib/models/Track'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')

    await connect()

    let query: any = { isBTSFamily: true }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      query.$or = [
        { name: searchRegex },
        { artist: searchRegex },
        { album: searchRegex }
      ]
    }

    const tracks = await Track.find(query)
      .select('spotifyId name artist album thumbnails audioFeatures popularity')
      .sort({ popularity: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({
      tracks,
      count: tracks.length
    })
  } catch (error) {
    console.error('Error fetching seed tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    )
  }
}
