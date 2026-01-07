import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import KworbSnapshot from '@/lib/models/KworbSnapshot'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const artist = searchParams.get('artist')
    const days = parseInt(searchParams.get('days') || '30')

    await connect()

    // Get historical snapshots for the last N days
    const snapshots = await KworbSnapshot.find()
      .sort({ dateKey: -1 })
      .limit(days)
      .lean() as any[]

    if (!snapshots || snapshots.length === 0) {
      return NextResponse.json({ ok: false, error: 'No data found' }, { status: 404 })
    }

    // Extract stream history for the artist
    const history = snapshots.map(snapshot => {
      const artistSongs = snapshot.songsByArtist?.find((g: any) => g.artist === artist)
      const totalStreams = artistSongs?.totals?.streams || 0
      const dailyGain = artistSongs?.totals?.daily || 0

      return {
        date: snapshot.dateKey,
        totalStreams,
        dailyGain
      }
    }).reverse() // Reverse to show oldest to newest

    return NextResponse.json({
      ok: true,
      history
    })
  } catch (err: any) {
    console.error('Kworb history error:', err)
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}
