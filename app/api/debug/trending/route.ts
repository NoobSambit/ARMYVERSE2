import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import KworbSnapshot from '@/lib/models/KworbSnapshot'
import YouTubeKworbSnapshot from '@/lib/models/YouTubeKworbSnapshot'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connect()
    
    const spotifySnapshot = await KworbSnapshot.findOne().sort({ dateKey: -1 }).lean() as any
    const youtubeSnapshot = await YouTubeKworbSnapshot.findOne().sort({ dateKey: -1 }).lean() as any
    
    const debug = {
      spotify: {
        exists: !!spotifySnapshot,
        dateKey: spotifySnapshot?.dateKey || null,
        artistCount: spotifySnapshot?.songsByArtist?.length || 0,
        artists: spotifySnapshot?.songsByArtist?.map((g: any) => ({
          name: g.artist,
          songCount: g.songs?.length || 0
        })) || []
      },
      youtube: {
        exists: !!youtubeSnapshot,
        dateKey: youtubeSnapshot?.dateKey || null,
        artistCount: youtubeSnapshot?.artistGroups?.length || 0,
        artists: youtubeSnapshot?.artistGroups?.map((g: any) => ({
          name: g.artist,
          songCount: g.songs?.length || 0
        })) || []
      }
    }
    
    return NextResponse.json(debug, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 })
  }
}
