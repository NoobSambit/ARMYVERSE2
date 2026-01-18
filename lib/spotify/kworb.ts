import * as cheerio from 'cheerio'
import type {
  ArtistSongsGroup,
  StreamRow,
  ArtistAlbumsGroup,
  AlbumRow,
  MonthlyListenerRow,
} from './kworbTypes'
import { makeSpotifyRequest } from './utils'

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36'
const fetchHTML = async (url: string) => {
  const res = await fetch(url, {
    headers: { 'user-agent': UA },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return await res.text()
}
const num = (s?: string) => (s ? Number(s.replace(/[^0-9.-]/g, '')) || 0 : 0)

// Extract Spotify track ID from kworb URL or spotify URL
const extractSpotifyTrackId = (url?: string): string | undefined => {
  if (!url) return undefined
  // kworb.net/spotify/track/TRACK_ID.html
  const kworbMatch = url.match(/\/track\/([a-zA-Z0-9]+)/)
  if (kworbMatch) return kworbMatch[1]
  // open.spotify.com/track/TRACK_ID
  const spotifyMatch = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/)
  if (spotifyMatch) return spotifyMatch[1]
  return undefined
}

// Get album art URL for a Spotify track using oEmbed API (no auth required)
const getSpotifyAlbumArt = async (
  trackId: string
): Promise<string | undefined> => {
  try {
    const oEmbedUrl = `https://open.spotify.com/oembed?url=spotify:track:${trackId}`
    const res = await fetch(oEmbedUrl, {
      headers: { 'user-agent': UA },
      cache: 'no-store',
    })
    if (!res.ok) return undefined
    const data = await res.json()
    return data.thumbnail_url || undefined
  } catch {
    return undefined
  }
}

// Extract Spotify album ID from kworb URL or spotify URL
const extractSpotifyAlbumId = (url?: string): string | undefined => {
  if (!url) return undefined
  // kworb.net/spotify/album/ALBUM_ID.html
  const kworbMatch = url.match(/\/album\/([a-zA-Z0-9]+)/)
  if (kworbMatch) return kworbMatch[1]
  // open.spotify.com/album/ALBUM_ID
  const spotifyMatch = url.match(/spotify\.com\/album\/([a-zA-Z0-9]+)/)
  if (spotifyMatch) return spotifyMatch[1]
  return undefined
}

// Extract Spotify artist ID from kworb URL or spotify URL
const extractSpotifyArtistId = (url?: string): string | undefined => {
  if (!url) return undefined
  // kworb.net/spotify/artist/ARTIST_ID.html or artist/ARTIST_ID_songs.html
  const kworbMatch = url.match(/\/artist\/([a-zA-Z0-9]+)(?:[_./]|$)/)
  if (kworbMatch) return kworbMatch[1]
  // open.spotify.com/artist/ARTIST_ID
  const spotifyMatch = url.match(/spotify\.com\/artist\/([a-zA-Z0-9]+)/)
  if (spotifyMatch) return spotifyMatch[1]
  return undefined
}

// Get album metadata from Spotify API (cover image, release date, album type)
const getSpotifyAlbumMetadata = async (
  albumId: string
): Promise<{
  coverImage?: string
  releaseDate?: string
  albumType?: string
}> => {
  try {
    const res = await makeSpotifyRequest(`/albums/${albumId}`)
    if (!res.ok) return {}
    const data = await res.json()
    return {
      coverImage: data.images?.[0]?.url,
      releaseDate: data.release_date,
      albumType: data.album_type, // 'album', 'single', 'compilation'
    }
  } catch {
    return {}
  }
}

async function fetchArtistSongsPage(
  pageUrl: string,
  artistLabel: string,
  options: { excludeFeatures?: boolean } = {}
): Promise<ArtistSongsGroup> {
  const html = await fetchHTML(pageUrl)
  const $ = cheerio.load(html)

  // find the header totals table by looking for THs that include Total/As lead/Solo/As feature
  const header = $('table')
    .filter((_, el) => {
      const headerText = $(el)
        .find('th')
        .map((_, th) => $(th).text().toLowerCase())
        .get()
        .join(' ')
      return headerText.includes('total') && headerText.includes('tracks')
    })
    .first()

  const findRowValue = (label: string) => {
    let val = 0
    header.find('tr').each((_, tr) => {
      const cells = $(tr).children()
      if (!cells.length) return
      const first = $(cells[0]).text().toLowerCase().trim()
      if (first === label) {
        // pick "Total" column (index 1)
        val = num($(cells[1]).text())
      }
    })
    return val
  }

  const totals = {
    streams: findRowValue('streams'),
    daily: findRowValue('daily'),
    tracks: findRowValue('tracks'),
  }

  // pick the detailed songs table using a robust heuristic
  let detailTable = $('table')
    .filter((_, el) => {
      const ths = $(el).find('th')
      const text = ths
        .map((_, th) => $(th).text().toLowerCase())
        .get()
        .join('|')
      return (
        text.includes('song') &&
        text.includes('streams') &&
        text.includes('daily')
      )
    })
    .first()

  if (!detailTable || detailTable.length === 0) {
    // Fallback: choose the table that has the most numeric rows where the last two cells look numeric
    let bestIdx = -1
    let bestScore = -1
    $('table').each((i, el) => {
      let score = 0
      $(el)
        .find('tr')
        .each((_, tr) => {
          const tds = $(tr).find('td')
          if (tds.length >= 3) {
            const a = num($(tds[tds.length - 2]).text())
            const b = num($(tds[tds.length - 1]).text())
            if (a || b) score += 1
          }
        })
      if (score > bestScore) {
        bestScore = score
        bestIdx = i
      }
    })
    if (bestIdx >= 0) detailTable = $('table').eq(bestIdx)
  }
  const songs: StreamRow[] = []
  // figure out column indexes from the header row
  const headerRow = detailTable.find('tr').first()
  const headerCells = headerRow.find('th')
  let idxName = 1,
    idxStreams = -1,
    idxDaily = -1
  headerCells.each((i, th) => {
    const t = $(th).text().toLowerCase()
    if (t.includes('song')) idxName = i
    if (t.includes('streams')) idxStreams = i
    if (t.includes('daily')) idxDaily = i
  })
  // fallback if not found
  if (idxStreams < 0) idxStreams = Math.max(headerCells.length - 2, 0)
  if (idxDaily < 0) idxDaily = Math.max(headerCells.length - 1, 1)

  const songPromises: Promise<StreamRow>[] = []

  detailTable
    .find('tr')
    .slice(1)
    .each((_, tr) => {
      const t = $(tr).find('td')
      if (t.length < 3) return
      const cellName = t.eq(idxName)
      const rawName = (cellName.text() || '').trim() || t.eq(0).text().trim()
      const isFeatureTrack = rawName.startsWith('*')
      const name = rawName
      if (!name) return
      if (options.excludeFeatures && isFeatureTrack) return
      const link =
        cellName.find('a').attr('href') || t.eq(0).find('a').attr('href')
      const url = link
        ? link.startsWith('http')
          ? link
          : 'https://kworb.net/spotify/' + link
        : undefined
      const totalStreams = num(t.eq(idxStreams).text())
      const dailyGain = num(t.eq(idxDaily).text())

      if (totalStreams) {
        // Extract Spotify track ID and fetch album art
        const trackId = extractSpotifyTrackId(url)
        const songPromise = (async () => {
          let albumArt: string | undefined
          if (trackId) {
            albumArt = await getSpotifyAlbumArt(trackId)
          }
          return {
            name,
            totalStreams,
            dailyGain,
            url,
            albumArt,
            spotifyId: trackId,
          } as StreamRow
        })()
        songPromises.push(songPromise)
      }
    })

  // Wait for all album art fetches to complete
  const resolvedSongs = await Promise.all(songPromises)
  songs.push(...resolvedSongs)

  // fallback totals from parsed songs if header failed
  if (!totals.streams && songs.length) {
    totals.streams = songs.reduce((a, s) => a + (s.totalStreams || 0), 0)
  }
  if (!totals.daily && songs.length) {
    totals.daily = songs.reduce((a, s) => a + (s.dailyGain || 0), 0)
  }
  if (!totals.tracks && songs.length) {
    totals.tracks = songs.length
  }
  if (options.excludeFeatures && songs.length) {
    totals.streams = songs.reduce((a, s) => a + (s.totalStreams || 0), 0)
    totals.daily = songs.reduce((a, s) => a + (s.dailyGain || 0), 0)
    totals.tracks = songs.length
  }

  return { artist: artistLabel, pageUrl, totals, songs }
}

export async function fetchBtsSongs() {
  // BTS and member artist pages
  const artists: Array<{ label: string; url: string; excludeFeatures?: boolean }> = [
    {
      label: 'BTS',
      url: 'https://kworb.net/spotify/artist/3Nrfpe0tUJi4K4DXYWgMUX_songs.html',
    },
    {
      label: 'Jin',
      url: 'https://kworb.net/spotify/artist/5vV3bFXnN6D6N3Nj4xRvaV_songs.html',
    },
    {
      label: 'Jungkook',
      url: 'https://kworb.net/spotify/artist/6HaGTQPmzraVmaVxvz6EUc_songs.html',
    },
    {
      label: 'J-Hope',
      url: 'https://kworb.net/spotify/artist/0b1sIQumIAsNbqAoIClSpy_songs.html',
      excludeFeatures: true,
    },
    {
      label: 'Suga',
      url: 'https://kworb.net/spotify/artist/0ebNdVaOfp6N0oZ1guIxM8_songs.html',
    },
    {
      label: 'Agust D',
      url: 'https://kworb.net/spotify/artist/5RmQ8k4l3HZ8JoPb4mNsML_songs.html',
    },
    {
      label: 'RM',
      url: 'https://kworb.net/spotify/artist/2auC28zjQyVTsiZKNgPRGs_songs.html',
    },
    {
      label: 'Jimin',
      url: 'https://kworb.net/spotify/artist/1oSPZhvZMIrWW5I41kPkkY_songs.html',
    },
    {
      label: 'V',
      url: 'https://kworb.net/spotify/artist/3JsHnjpbhX4SnySpvpa9DK_songs.html',
    },
  ]
  const settled = await Promise.allSettled(
    artists.map(({ label, url, excludeFeatures }) =>
      fetchArtistSongsPage(url, label, { excludeFeatures })
    )
  )
  const groups = settled
    .filter(
      (r): r is PromiseFulfilledResult<ArtistSongsGroup> =>
        r.status === 'fulfilled'
    )
    .map(r => r.value)
  return groups
}

export async function fetchBtsAlbums() {
  const artists: Array<[string, string]> = [
    [
      'BTS',
      'https://kworb.net/spotify/artist/3Nrfpe0tUJi4K4DXYWgMUX_albums.html',
    ],
    [
      'Jin',
      'https://kworb.net/spotify/artist/5vV3bFXnN6D6N3Nj4xRvaV_albums.html',
    ],
    [
      'Jungkook',
      'https://kworb.net/spotify/artist/6HaGTQPmzraVmaVxvz6EUc_albums.html',
    ],
    [
      'J-Hope',
      'https://kworb.net/spotify/artist/0b1sIQumIAsNbqAoIClSpy_albums.html',
    ],
    [
      'Suga',
      'https://kworb.net/spotify/artist/0ebNdVaOfp6N0oZ1guIxM8_albums.html',
    ],
    [
      'Agust D',
      'https://kworb.net/spotify/artist/5RmQ8k4l3HZ8JoPb4mNsML_albums.html',
    ],
    [
      'RM',
      'https://kworb.net/spotify/artist/2auC28zjQyVTsiZKNgPRGs_albums.html',
    ],
    [
      'Jimin',
      'https://kworb.net/spotify/artist/1oSPZhvZMIrWW5I41kPkkY_albums.html',
    ],
    [
      'V',
      'https://kworb.net/spotify/artist/3JsHnjpbhX4SnySpvpa9DK_albums.html',
    ],
  ]

  const fetchArtistAlbumsPage = async (
    pageUrl: string,
    artistLabel: string
  ): Promise<ArtistAlbumsGroup> => {
    const html = await fetchHTML(pageUrl)
    const $ = cheerio.load(html)

    // header totals similar to songs page
    const header = $('table')
      .filter((_, el) => {
        const headerText = $(el)
          .find('th')
          .map((_, th) => $(th).text().toLowerCase())
          .get()
          .join(' ')
        return headerText.includes('total') && headerText.includes('tracks')
      })
      .first()

    const findRowValue = (label: string) => {
      let val = 0
      header.find('tr').each((_, tr) => {
        const cells = $(tr).children()
        if (!cells.length) return
        const first = $(cells[0]).text().toLowerCase().trim()
        if (first === label) val = num($(cells[1]).text())
      })
      return val
    }

    const totals = {
      streams: findRowValue('streams'),
      daily: findRowValue('daily'),
      tracks: findRowValue('tracks'),
    }

    // albums table extraction: rely on album anchors then read numeric cells in same row
    const albumPromises: Promise<AlbumRow>[] = []
    $('a[href*="open.spotify.com/album"]').each((_, a) => {
      const row = $(a).closest('tr')
      const tds = row.find('td')
      if (tds.length < 3) return
      const name = $(a).text().trim()
      const link = $(a).attr('href')
      const url = link
        ? link.startsWith('http')
          ? link
          : 'https://kworb.net/spotify/' + link
        : undefined
      const totalStreams = num($(tds[tds.length - 2]).text())
      const dailyGain = num($(tds[tds.length - 1]).text())

      if (name && totalStreams) {
        // Extract Spotify album ID and fetch metadata
        const albumId = extractSpotifyAlbumId(url)
        const albumPromise = (async () => {
          let spotifyId: string | undefined = albumId
          let coverImage: string | undefined
          let releaseDate: string | undefined
          let albumType: string | undefined

          if (albumId) {
            const metadata = await getSpotifyAlbumMetadata(albumId)
            coverImage = metadata.coverImage
            releaseDate = metadata.releaseDate
            albumType = metadata.albumType
          }

          return {
            name,
            totalStreams,
            dailyGain,
            url,
            spotifyId,
            coverImage,
            releaseDate,
            albumType,
          } as AlbumRow
        })()
        albumPromises.push(albumPromise)
      }
    })

    // Wait for all album metadata fetches to complete
    const albums = await Promise.all(albumPromises)

    if (!totals.streams && albums.length)
      totals.streams = albums.reduce((a, s) => a + (s.totalStreams || 0), 0)
    if (!totals.daily && albums.length)
      totals.daily = albums.reduce((a, s) => a + (s.dailyGain || 0), 0)
    if (!totals.tracks && albums.length) totals.tracks = albums.length

    return { artist: artistLabel, pageUrl, totals, albums }
  }

  const settled = await Promise.allSettled(
    artists.map(([label, url]) => fetchArtistAlbumsPage(url, label))
  )
  const groups = settled
    .filter(
      (r): r is PromiseFulfilledResult<ArtistAlbumsGroup> =>
        r.status === 'fulfilled'
    )
    .map(r => r.value)
  return groups
}

const MEMBERS = [
  'BTS',
  'Jimin',
  'Jungkook',
  'RM',
  'Suga',
  'J-Hope',
  'Jin',
  'Agust D',
  'j-hope',
  'jhope',
  'j hope',
]
const BTS_ARTIST_IDS = new Set([
  '3Nrfpe0tUJi4K4DXYWgMUX', // BTS
  '5vV3bFXnN6D6N3Nj4xRvaV', // Jin
  '6HaGTQPmzraVmaVxvz6EUc', // Jungkook
  '0b1sIQumIAsNbqAoIClSpy', // J-Hope
  '0ebNdVaOfp6N0oZ1guIxM8', // Suga
  '5RmQ8k4l3HZ8JoPb4mNsML', // Agust D
  '2auC28zjQyVTsiZKNgPRGs', // RM
  '1oSPZhvZMIrWW5I41kPkkY', // Jimin
  '3JsHnjpbhX4SnySpvpa9DK', // V
])
const V_EXACT = 'V' // Special handling for V to avoid false matches

// Helper to check if artist is a BTS member
const isBTSMember = (artistName: string): boolean => {
  if (!artistName) return false
  const name = artistName.trim()
  const normalized = name.toLowerCase().replace(/\s+/g, '') // Remove all spaces for matching

  // Exact match for V (avoid matching "Dei V", "L.V.", etc.)
  if (name === V_EXACT) return true

  // Check for exact match (for main artists like "BTS", "J-Hope", etc.)
  const exactMatch = MEMBERS.some(
    m => m.toLowerCase().replace(/\s+/g, '') === normalized
  )
  if (exactMatch) return true

  // Check if any member name appears as a feature with proper separators
  // Only match when member name is preceded/followed by feature indicators like:
  // ( w/ feat. featuring with , or boundaries
  return MEMBERS.some(m => {
    const memberRegex = new RegExp(
      `(?:\\(|\\bw\\/|\\bfeat\\.?|\\bfeaturing|\\bwith|,)\\s*${m.replace(
        /[-\/\\^$*+?.()|[\]{}]/g,
        '\\$&'
      )}\\b`,
      'i'
    )
    return memberRegex.test(name)
  })
}

export async function fetchDaily200Positions() {
  const html = await fetchHTML(
    'https://kworb.net/spotify/country/global_daily.html'
  )
  const $ = cheerio.load(html)
  const rows: any[] = []
  $('table tr').each((_, tr) => {
    const t = $(tr).find('td')
    if (t.length < 9) return
    const rank = num($(t[0]).text())
    // Column 1: Rank change (P+) - shows "=", "+3", "-1", etc.
    const rankChangeText = $(t[1]).text().trim()
    // Column 2 contains "Artist and Title" combined
    const artistCell = t.eq(2)
    const artistAndTitle = artistCell.text().trim()
    const hasBtsArtistLink = artistCell
      .find('a')
      .toArray()
      .some(a => {
        const href = $(a).attr('href')
        const artistId = extractSpotifyArtistId(href)
        return artistId ? BTS_ARTIST_IDS.has(artistId) : false
      })
    // Column 6: Streams (total), Column 7: Streams+ (daily change)
    const streamsText = $(t[6]).text().trim()
    const dailyStreamsText = $(t[7]).text().trim()
    const streams = streamsText ? num(streamsText) : 0
    const daily = dailyStreamsText ? num(dailyStreamsText) : 0

    // Parse rank change: "=" means no change, "+3" means up 3, "-1" means down 1
    let rankChange = 0
    if (rankChangeText !== '=') {
      rankChange = num(rankChangeText)
    }

    if (!rank) return
    // Try to extract artist and track name from the combined column
    // Format is "Artist - Track"
    let artist = ''
    let name = ''
    if (artistAndTitle.includes(' - ')) {
      const parts = artistAndTitle.split(' - ')
      artist = parts[0].trim()
      name = parts.slice(1).join(' - ').trim()
    } else {
      artist = artistAndTitle
      name = artistAndTitle
    }

    if (
      hasBtsArtistLink ||
      isBTSMember(artist) ||
      isBTSMember(name) ||
      isBTSMember(artistAndTitle)
    ) {
      rows.push({ rank, rankChange, artist, name, streams, daily })
    }
  })
  return rows
}

export async function fetchMostStreamedArtists() {
  const html = await fetchHTML('https://kworb.net/spotify/artists.html')
  const $ = cheerio.load(html)
  const rows: any[] = []
  let currentRank = 0
  $('table tr').each((_, tr) => {
    const t = $(tr).find('td')
    if (t.length < 3) return
    currentRank++
    const artist = $(t[0]).text().trim()
    const url = $(t[0]).find('a').attr('href')
      ? 'https://kworb.net/spotify/' + $(t[0]).find('a').attr('href')
      : undefined
    const streamsRaw = $(t[1]).text().trim()
    const dailyRaw = $(t[2]).text().trim()
    // Streams and Daily are in millions on kworb - convert to actual numbers
    const streams = num(streamsRaw) * 1_000_000
    const daily = num(dailyRaw) * 1_000_000
    // Only include BTS and members
    if (artist && isBTSMember(artist)) {
      rows.push({ rank: currentRank, artist, streams, daily, url })
    }
  })
  return rows
}

export async function fetchMonthlyListeners(): Promise<MonthlyListenerRow[]> {
  const MAX_PAGES = 10 // Safety limit to prevent infinite loops
  const REQUIRED_MEMBERS = new Set([
    'bts',
    'jin',
    'jungkook',
    'jhope',
    'suga',
    'rm',
    'jimin',
    'v',
    'agustd',
  ])
  const rows: MonthlyListenerRow[] = []
  const foundArtists = new Set<string>()
  const normalizeArtistKey = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]/g, '')

  // Fetch from multiple listeners pages until we find all BTS members or hit max pages
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url =
      page === 1
        ? 'https://kworb.net/spotify/listeners.html'
        : `https://kworb.net/spotify/listeners${page}.html`

    try {
      const html = await fetchHTML(url)
      const $ = cheerio.load(html)

      $('table tr').each((_, tr) => {
        const t = $(tr).find('td')
        if (t.length < 4) return
        const rank = num($(t[0]).text())
        const artist = $(t[1]).text().trim()
        const href = $(t[1]).find('a').attr('href')
        // Normalize artist name for duplicate checking (case-insensitive, remove spaces)
        const normalizedArtist = normalizeArtistKey(artist)
        const listeners = num($(t[2]).text())
        const dailyChange = num($(t[3]).text()) // Daily +/- column

        // Only include BTS and members, and avoid duplicates
        if (
          rank &&
          artist &&
          isBTSMember(artist) &&
          !foundArtists.has(normalizedArtist)
        ) {
          foundArtists.add(normalizedArtist)
          rows.push({ rank, artist, listeners, dailyChange, url: href })
        }
      })

      // If we've found all members, stop fetching more pages
      const hasAllRequired = Array.from(REQUIRED_MEMBERS).every(key =>
        foundArtists.has(key)
      )
      if (hasAllRequired) {
        break
      }
    } catch (error) {
      // If page doesn't exist (404), stop trying
      if (error instanceof Error && error.message.includes('404')) {
        break
      }
      // Log other errors but continue trying
      console.warn(`Failed to fetch ${url}:`, error)
    }
  }

  return rows
}
