import { NextResponse } from 'next/server'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || ''
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ''

type TrendingTrack = {
  id: string
  name: string
  artist: string
  album: string
  albumArt: string
  popularity: number
  duration: string
  spotifyUrl: string
  releaseDate: string
  estimatedStreams: number
  badges: Array<{ type: string; text: string; color: string }>
}

type MemberSpotlight = {
  member: string
  track: {
    id: string
    name: string
    artist: string
    album: string
    albumArt: string
    popularity: number
    spotifyUrl: string
    estimatedStreams: number
  }
}

let cache: { data: { tracks: TrendingTrack[]; members: MemberSpotlight[] }; expiresAt: number } | null = null
const TTL_MS = 5 * 60 * 1000

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = Date.now()
    if (cache && cache.expiresAt > now) {
      return NextResponse.json(cache.data)
    }

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      return NextResponse.json({ tracks: [], members: [] }, { status: 200 })
    }

    const token = await getSpotifyToken()
    if (!token) {
      return NextResponse.json({ tracks: [], members: [] }, { status: 200 })
    }

    const [tracks, members] = await Promise.all([
      fetchBtsTrendingTracks(token),
      fetchMembersSpotlight(token)
    ])

    const data = { tracks, members }
    cache = { data, expiresAt: now + TTL_MS }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ tracks: [], members: [] }, { status: 200 })
  }
}

async function getSpotifyToken(): Promise<string | null> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
      },
      body: 'grant_type=client_credentials'
    })
    const data = await response.json()
    return data.access_token || null
  } catch {
    return null
  }
}

function formatDuration(ms: number): string {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function badges(count: number): Array<{ type: string; text: string; color: string }> {
  const arr: Array<{ type: string; text: string; color: string }> = []
  if (count >= 80) arr.push({ type: 'popularity', text: '🔥 Hot', color: 'bg-red-500' })
  return arr
}

async function fetchBtsTrendingTracks(token: string): Promise<TrendingTrack[]> {
  try {
    const res = await fetch('https://api.spotify.com/v1/search?q=BTS&type=track&limit=20&market=US', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    const items = data?.tracks?.items || []
    return items
      .filter((track: any) => track.artists.some((a: any) => a.name === 'BTS'))
      .slice(0, 5)
      .map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        albumArt: track.album.images[0]?.url,
        popularity: track.popularity,
        duration: formatDuration(track.duration_ms),
        spotifyUrl: track.external_urls.spotify,
        releaseDate: track.album.release_date,
        estimatedStreams: track.popularity,
        badges: badges(track.popularity)
      }))
  } catch {
    return []
  }
}

async function fetchMembersSpotlight(token: string): Promise<MemberSpotlight[]> {
  const members = [
    { name: 'Jimin', id: '1oSPZhvZMIrWW5I41kPkkY' },
    { name: 'Jungkook', id: '6HaGTQPmzraVmaVxvz6EUc' },
    { name: 'V', id: '3JsHnjpbhX4SnySpvpa9DK' },
    { name: 'RM', id: '2auC28zjQyVTsiZKNgPRGs' },
    { name: 'Suga', id: '5RmQ8k4l3HZ8JoPb4mNsML' },
    { name: 'J-Hope', id: '0b1sIQumIAsNbqAoIClSpy' },
    { name: 'Jin', id: '5vV3bFXnN6D6N3Nj4xRvaV' }
  ]

  const results: MemberSpotlight[] = []
  for (const m of members) {
    try {
      const res = await fetch(`https://api.spotify.com/v1/artists/${m.id}/top-tracks?market=US`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      const top = data?.tracks?.[0]
      if (top) {
        results.push({
          member: m.name,
          track: {
            id: top.id,
            name: top.name,
            artist: top.artists.map((a: any) => a.name).join(', '),
            album: top.album.name,
            albumArt: top.album.images[0]?.url,
            popularity: top.popularity,
            spotifyUrl: top.external_urls.spotify,
            estimatedStreams: top.popularity
          }
        })
      }
    } catch {
      // skip
    }
  }
  return results
}


