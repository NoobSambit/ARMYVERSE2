import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import KworbSnapshot from '@/lib/models/KworbSnapshot'
import { ChangeData } from '@/lib/spotify/kworbSnapshotTypes'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function formatDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

function compareSnapshots(
  current: any,
  previous: any | null
): ChangeData | null {
  if (!previous) {
    return null
  }

  const changes: ChangeData = {
    songsByArtist: {},
    totalSongs: (current.songs?.length || 0) - (previous.songs?.length || 0),
    totalAlbums: (current.albums?.length || 0) - (previous.albums?.length || 0),
    daily200Entries: (current.daily200?.length || 0) - (previous.daily200?.length || 0),
    daily200: {},
    artistsAllTime: {},
    monthlyListeners: {}
  }

  // Compare songsByArtist totals
  if (Array.isArray(current.songsByArtist)) {
    current.songsByArtist.forEach((currentGroup: any) => {
      const artist = currentGroup.artist
      const prevGroup = previous.songsByArtist?.find((g: any) => g.artist === artist)

      if (prevGroup) {
        changes.songsByArtist[artist] = {
          streamsChange: (currentGroup.totals?.streams || 0) - (prevGroup.totals?.streams || 0),
          dailyChange: (currentGroup.totals?.daily || 0) - (prevGroup.totals?.daily || 0),
          tracksChange: (currentGroup.totals?.tracks || 0) - (prevGroup.totals?.tracks || 0)
        }
      }
    })
  }

  // Compare artistsAllTime rankings
  if (Array.isArray(current.artistsAllTime)) {
    current.artistsAllTime.forEach((currentRank: any) => {
      const artist = currentRank.artist
      const prevRank = previous.artistsAllTime?.find((r: any) => r.artist === artist)

      if (prevRank) {
        // Positive change = rank improved (lower number)
        changes.artistsAllTime[artist] = {
          rankChange: prevRank.rank - currentRank.rank
        }
      }
    })
  }

  // Compare monthlyListeners rankings
  if (Array.isArray(current.monthlyListeners)) {
    current.monthlyListeners.forEach((currentRank: any) => {
      const artist = currentRank.artist
      const prevRank = previous.monthlyListeners?.find((r: any) => r.artist === artist)

      if (prevRank) {
        // Positive change = rank improved (lower number)
        changes.monthlyListeners[artist] = {
          rankChange: prevRank.rank - currentRank.rank
        }
      }
    })
  }

  // Compare daily200 streams and ranks
  if (Array.isArray(current.daily200)) {
    current.daily200.forEach((currentEntry: any) => {
      // Create a unique key using rank + name or artist
      const key = `${currentEntry.rank}-${currentEntry.name || currentEntry.artist}`
      const prevEntry = previous.daily200?.find((r: any) =>
        r.name === currentEntry.name || r.artist === currentEntry.artist
      )

      if (prevEntry) {
        changes.daily200[key] = {
          rankChange: prevEntry.rank - currentEntry.rank,
          streamsChange: (currentEntry.streams || 0) - (prevEntry.streams || 0)
        }
      }
    })
  }

  return changes
}

export async function GET() {
  try {
    await connect()

    // Get current snapshot
    const current = await KworbSnapshot.findOne()
      .sort({ dateKey: -1 })
      .lean() as any

    if (!current) {
      return NextResponse.json(
        { ok: false, error: 'No snapshots found' },
        { status: 404 }
      )
    }

    const currentDate = new Date(current.dateKey as string)

    // Calculate target dates
    const date24h = new Date(currentDate)
    date24h.setDate(date24h.getDate() - 1)
    const dateKey24h = formatDateKey(date24h)

    const date7d = new Date(currentDate)
    date7d.setDate(date7d.getDate() - 7)
    const dateKey7d = formatDateKey(date7d)

    // Fetch historical snapshots
    const [snapshot24h, snapshot7d] = await Promise.all([
      KworbSnapshot.findOne({ dateKey: dateKey24h }).lean() as Promise<any>,
      KworbSnapshot.findOne({ dateKey: dateKey7d }).lean() as Promise<any>
    ])

    // Calculate changes
    const changes24h = compareSnapshots(current, snapshot24h)
    const changes7d = compareSnapshots(current, snapshot7d)

    return NextResponse.json({
      ok: true,
      current,
      snapshot24h,
      snapshot7d,
      changes24h,
      changes7d,
      meta: {
        currentDate: current.dateKey,
        date24h: snapshot24h?.dateKey || null,
        date7d: snapshot7d?.dateKey || null
      }
    }, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (err: any) {
    console.error('Kworb compare error:', err)
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    )
  }
}
