import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import KworbSnapshot from '@/lib/models/KworbSnapshot'
import { ChangeData } from '@/lib/spotify/kworbSnapshotTypes'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function formatDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

function getSnapshotTotal(snapshot: any, type: 'songs' | 'albums'): number {
  if (snapshot[type]?.length > 0) return snapshot[type].length

  const groupKey = type === 'songs' ? 'songsByArtist' : 'albumsByArtist'
  if (Array.isArray(snapshot[groupKey])) {
    return snapshot[groupKey].reduce((acc: number, group: any) => acc + (group[type]?.length || 0), 0)
  }

  return 0
}

function compareSnapshots(current: any, previous: any | null): ChangeData | null {
  if (!previous) return null

  const changes: ChangeData = {
    songsByArtist: {},
    totalSongs: getSnapshotTotal(current, 'songs') - getSnapshotTotal(previous, 'songs'),
    totalAlbums: getSnapshotTotal(current, 'albums') - getSnapshotTotal(previous, 'albums'),
    daily200Entries: (current.daily200?.length || 0) - (previous.daily200?.length || 0),
    daily200: {},
    artistsAllTime: {},
    monthlyListeners: {}
  }

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

  if (Array.isArray(current.artistsAllTime)) {
    current.artistsAllTime.forEach((currentRank: any) => {
      const artist = currentRank.artist
      const prevRank = previous.artistsAllTime?.find((r: any) => r.artist.toLowerCase() === artist.toLowerCase())
      if (prevRank) {
        changes.artistsAllTime[artist] = { rankChange: prevRank.rank - currentRank.rank }
      }
    })
  }

  if (Array.isArray(current.monthlyListeners)) {
    current.monthlyListeners.forEach((currentRank: any) => {
      const artist = currentRank.artist
      const prevRank = previous.monthlyListeners?.find((r: any) => r.artist.toLowerCase() === artist.toLowerCase())
      if (prevRank) {
        changes.monthlyListeners[artist] = { rankChange: prevRank.rank - currentRank.rank }
      }
    })
  }

  if (Array.isArray(current.daily200)) {
    current.daily200.forEach((currentEntry: any) => {
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeChanges = searchParams.get('includeChanges') === 'true'

    await connect()
    const snapshot = await KworbSnapshot.findOne().sort({ dateKey: -1 }).lean() as any

    if (!snapshot) {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    }

    if (includeChanges) {
      const currentDate = new Date(snapshot.dateKey as string)

      const date24h = new Date(currentDate)
      date24h.setDate(date24h.getDate() - 1)
      const dateKey24h = formatDateKey(date24h)

      const date7d = new Date(currentDate)
      date7d.setDate(date7d.getDate() - 7)
      const dateKey7d = formatDateKey(date7d)

      const [snapshot24h, snapshot7d] = await Promise.all([
        KworbSnapshot.findOne({ dateKey: dateKey24h }).lean() as Promise<any>,
        KworbSnapshot.findOne({ dateKey: dateKey7d }).lean() as Promise<any>
      ])

      const changes24h = compareSnapshots(snapshot, snapshot24h)
      const changes7d = compareSnapshots(snapshot, snapshot7d)

      return NextResponse.json({
        ok: true,
        snapshot,
        changes24h,
        changes7d,
        meta: {
          currentDate: snapshot.dateKey,
          date24h: snapshot24h?.dateKey || null,
          date7d: snapshot7d?.dateKey || null
        }
      }, {
        headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' }
      })
    }

    return NextResponse.json({ ok: true, snapshot }, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' }
    })
  } catch (err: any) {
    console.error('Kworb latest error:', err)
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}


