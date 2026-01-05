import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import { Playlist } from '@/lib/models/Playlist'

export const runtime = 'nodejs'

// GET: Fetch user's playlist history
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const firebaseUid = searchParams.get('firebaseUid')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId && !firebaseUid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    await connect()

    const query: any = {}
    if (firebaseUid) {
      query.firebaseUid = firebaseUid
    } else if (userId) {
      query.userId = userId
    }

    const playlists = await Playlist.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name prompt moods createdAt generationParams tracks')
      .lean()

    const formattedPlaylists = playlists.map((p: any) => ({
      id: p._id.toString(),
      name: p.name,
      prompt: p.prompt,
      moods: p.moods || [],
      trackCount: p.tracks?.length || 0,
      createdAt: p.createdAt,
      generationParams: p.generationParams
    }))

    return NextResponse.json({
      playlists: formattedPlaylists
    })

  } catch (error) {
    console.error('Failed to fetch playlist history:', error)
    return NextResponse.json({
      error: 'Failed to fetch playlist history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE: Delete a specific playlist
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const playlistId = searchParams.get('playlistId')
    const userId = searchParams.get('userId')
    const firebaseUid = searchParams.get('firebaseUid')

    if (!playlistId) {
      return NextResponse.json({ error: 'Playlist ID required' }, { status: 400 })
    }

    if (!userId && !firebaseUid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    await connect()

    const query: any = { _id: playlistId }
    if (firebaseUid) {
      query.firebaseUid = firebaseUid
    } else if (userId) {
      query.userId = userId
    }

    const result = await Playlist.findOneAndDelete(query)

    if (!result) {
      return NextResponse.json({ error: 'Playlist not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Failed to delete playlist:', error)
    return NextResponse.json({
      error: 'Failed to delete playlist',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
