import { NextResponse } from 'next/server'
import { connect } from '@/lib/db/mongoose'
import KworbSnapshot from '@/lib/models/KworbSnapshot'
import { fetchBtsSongs, fetchBtsAlbums, fetchDaily200Positions, fetchMostStreamedArtists, fetchMonthlyListeners } from '@/lib/spotify/kworb'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function runJob() {
  await connect()
  const [songsByArtist, albumsByArtist, daily200, artistsAllTime, monthlyListeners] = await Promise.all([
    fetchBtsSongs(), fetchBtsAlbums(), fetchDaily200Positions(), fetchMostStreamedArtists(), fetchMonthlyListeners()
  ])

  const d = new Date()
  const dateKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`

  const update: any = { dateKey }
  if (Array.isArray(songsByArtist) && songsByArtist.length) update.songsByArtist = songsByArtist
  if (Array.isArray(albumsByArtist) && albumsByArtist.length) update.albumsByArtist = albumsByArtist
  if (Array.isArray(daily200) && daily200.length) update.daily200 = daily200
  if (Array.isArray(artistsAllTime) && artistsAllTime.length) update.artistsAllTime = artistsAllTime
  if (Array.isArray(monthlyListeners) && monthlyListeners.length) update.monthlyListeners = monthlyListeners

  await KworbSnapshot.findOneAndUpdate(
    { dateKey },
    update,
    { upsert: true }
  )

  return dateKey
}

function isDevBypassAllowed() {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_CRON_AUTH === '1'
}

export async function POST(request: Request) {
  try {
    if (!isDevBypassAllowed()) {
      const isVercelCron = (request.headers.get('x-vercel-cron') || '').toString() === '1'
      if (!isVercelCron) {
        const authHeader = request.headers.get('authorization') || ''
        const xCron = request.headers.get('x-cron-secret') || ''
        const tokenFromAuth = authHeader.startsWith('Bearer ')
          ? authHeader.slice('Bearer '.length)
          : ''
        const provided = (tokenFromAuth || xCron).trim().replace(/^"|"$/g, '')
        const expected = (process.env.CRON_SECRET || '').trim()
        if (!provided || !expected || provided !== expected) {
          return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
        }
      }
    }

    const dateKey = await runJob()
    return NextResponse.json({ ok: true, dateKey })
  } catch (err: any) {
    console.error('Kworb cron error:', err)
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}

export async function GET(request: Request) {
  // Convenience for local testing when DISABLE_CRON_AUTH=1
  return POST(request)
}


