import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Album } from '@/lib/models/Album'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    await connect()

    const { searchParams } = new URL(request.url)
    const btsFamilyParam = searchParams.get('btsFamily')
    const limitParam = searchParams.get('limit')
    const isBTSFamily = btsFamilyParam !== 'false'
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined

    const query = isBTSFamily ? { isBTSFamily: true } : {}
    const albumsQuery = Album.find(query)
      .select('name artist coverImage spotifyId trackCount releaseDate')
      .sort({ artist: 1, releaseDate: 1, name: 1 })
      .lean()

    if (Number.isFinite(limit) && limit && limit > 0) {
      albumsQuery.limit(limit)
    }

    const albums = await albumsQuery
    return NextResponse.json({ albums })
  } catch (error) {
    console.error('Failed to load albums:', error)
    return NextResponse.json({ error: 'Failed to load albums' }, { status: 500 })
  }
}
