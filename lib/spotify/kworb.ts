import * as cheerio from 'cheerio'
import type { ArtistSongsGroup, StreamRow, ArtistAlbumsGroup, AlbumRow } from './kworbTypes'

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36'
const fetchHTML = async (url: string) => {
  const res = await fetch(url, { headers: { 'user-agent': UA }, cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return await res.text()
}
const num = (s?: string) => (s ? Number(s.replace(/[^0-9.-]/g, '')) || 0 : 0)

async function fetchArtistSongsPage(pageUrl: string, artistLabel: string): Promise<ArtistSongsGroup> {
  const html = await fetchHTML(pageUrl)
  const $ = cheerio.load(html)

  // find the header totals table by looking for THs that include Total/As lead/Solo/As feature
  const header = $('table').filter((_, el) => {
    const headerText = $(el).find('th').map((_, th) => $(th).text().toLowerCase()).get().join(' ')
    return headerText.includes('total') && headerText.includes('tracks')
  }).first()

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
    tracks: findRowValue('tracks')
  }

  // pick the detailed songs table using a robust heuristic
  let detailTable = $('table').filter((_, el) => {
    const ths = $(el).find('th')
    const text = ths.map((_, th) => $(th).text().toLowerCase()).get().join('|')
    return text.includes('song') && text.includes('streams') && text.includes('daily')
  }).first()

  if (!detailTable || detailTable.length === 0) {
    // Fallback: choose the table that has the most numeric rows where the last two cells look numeric
    let bestIdx = -1
    let bestScore = -1
    $('table').each((i, el) => {
      let score = 0
      $(el).find('tr').each((_, tr) => {
        const tds = $(tr).find('td')
        if (tds.length >= 3) {
          const a = num($(tds[tds.length - 2]).text())
          const b = num($(tds[tds.length - 1]).text())
          if (a || b) score += 1
        }
      })
      if (score > bestScore) { bestScore = score; bestIdx = i }
    })
    if (bestIdx >= 0) detailTable = $('table').eq(bestIdx)
  }
  const songs: StreamRow[] = []
  // figure out column indexes from the header row
  const headerRow = detailTable.find('tr').first()
  const headerCells = headerRow.find('th')
  let idxName = 1, idxStreams = -1, idxDaily = -1
  headerCells.each((i, th) => {
    const t = $(th).text().toLowerCase()
    if (t.includes('song')) idxName = i
    if (t.includes('streams')) idxStreams = i
    if (t.includes('daily')) idxDaily = i
  })
  // fallback if not found
  if (idxStreams < 0) idxStreams = Math.max(headerCells.length - 2, 0)
  if (idxDaily < 0) idxDaily = Math.max(headerCells.length - 1, 1)

  detailTable.find('tr').slice(1).each((_, tr) => {
    const t = $(tr).find('td')
    if (t.length < 3) return
    const cellName = t.eq(idxName)
    const name = (cellName.text() || '').trim() || t.eq(0).text().trim()
    if (!name) return
    const link = cellName.find('a').attr('href') || t.eq(0).find('a').attr('href')
    const url = link ? (link.startsWith('http') ? link : 'https://kworb.net/spotify/' + link) : undefined
    const totalStreams = num(t.eq(idxStreams).text())
    const dailyGain = num(t.eq(idxDaily).text())
    if (totalStreams) songs.push({ name, totalStreams, dailyGain, url })
  })

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

  return { artist: artistLabel, pageUrl, totals, songs }
}

export async function fetchBtsSongs() {
  // BTS and member artist pages
  const artists: Array<[string, string]> = [
    ['BTS', 'https://kworb.net/spotify/artist/3Nrfpe0tUJi4K4DXYWgMUX_songs.html'],
    ['Jin', 'https://kworb.net/spotify/artist/5vV3bFXnN6D6N3Nj4xRvaV_songs.html'],
    ['Jungkook', 'https://kworb.net/spotify/artist/6HaGTQPmzraVmaVxvz6EUc_songs.html'],
    ['J-Hope', 'https://kworb.net/spotify/artist/0b1sIQumIAsNbqAoIClSpy_songs.html'],
    ['Suga', 'https://kworb.net/spotify/artist/0ebNdVaOfp6N0oZ1guIxM8_songs.html'],
    ['Agust D', 'https://kworb.net/spotify/artist/5RmQ8k4l3HZ8JoPb4mNsML_songs.html'],
    ['RM', 'https://kworb.net/spotify/artist/2auC28zjQyVTsiZKNgPRGs_songs.html'],
    ['Jimin', 'https://kworb.net/spotify/artist/1oSPZhvZMIrWW5I41kPkkY_songs.html'],
    ['V', 'https://kworb.net/spotify/artist/3JsHnjpbhX4SnySpvpa9DK_songs.html']
  ]
  const settled = await Promise.allSettled(artists.map(([label, url]) => fetchArtistSongsPage(url, label)))
  const groups = settled
    .filter((r): r is PromiseFulfilledResult<ArtistSongsGroup> => r.status === 'fulfilled')
    .map(r => r.value)
  return groups
}

export async function fetchBtsAlbums() {
  const artists: Array<[string, string]> = [
    ['BTS', 'https://kworb.net/spotify/artist/3Nrfpe0tUJi4K4DXYWgMUX_albums.html'],
    ['Jin', 'https://kworb.net/spotify/artist/5vV3bFXnN6D6N3Nj4xRvaV_albums.html'],
    ['Jungkook', 'https://kworb.net/spotify/artist/6HaGTQPmzraVmaVxvz6EUc_albums.html'],
    ['J-Hope', 'https://kworb.net/spotify/artist/0b1sIQumIAsNbqAoIClSpy_albums.html'],
    ['Suga', 'https://kworb.net/spotify/artist/0ebNdVaOfp6N0oZ1guIxM8_albums.html'],
    ['Agust D', 'https://kworb.net/spotify/artist/5RmQ8k4l3HZ8JoPb4mNsML_albums.html'],
    ['RM', 'https://kworb.net/spotify/artist/2auC28zjQyVTsiZKNgPRGs_albums.html'],
    ['Jimin', 'https://kworb.net/spotify/artist/1oSPZhvZMIrWW5I41kPkkY_albums.html'],
    ['V', 'https://kworb.net/spotify/artist/3JsHnjpbhX4SnySpvpa9DK_albums.html']
  ]

  const fetchArtistAlbumsPage = async (pageUrl: string, artistLabel: string): Promise<ArtistAlbumsGroup> => {
    const html = await fetchHTML(pageUrl)
    const $ = cheerio.load(html)

    // header totals similar to songs page
    const header = $('table').filter((_, el) => {
      const headerText = $(el).find('th').map((_, th) => $(th).text().toLowerCase()).get().join(' ')
      return headerText.includes('total') && headerText.includes('tracks')
    }).first()

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
      tracks: findRowValue('tracks')
    }

    // albums table extraction: rely on album anchors then read numeric cells in same row
    const albums: AlbumRow[] = []
    $('a[href*="open.spotify.com/album"]').each((_, a) => {
      const row = $(a).closest('tr')
      const tds = row.find('td')
      if (tds.length < 3) return
      const name = $(a).text().trim()
      const link = $(a).attr('href')
      const url = link ? (link.startsWith('http') ? link : 'https://kworb.net/spotify/' + link) : undefined
      const totalStreams = num($(tds[tds.length - 2]).text())
      const dailyGain = num($(tds[tds.length - 1]).text())
      if (name && totalStreams) albums.push({ name, totalStreams, dailyGain, url })
    })

    if (!totals.streams && albums.length) totals.streams = albums.reduce((a, s) => a + (s.totalStreams || 0), 0)
    if (!totals.daily && albums.length) totals.daily = albums.reduce((a, s) => a + (s.dailyGain || 0), 0)
    if (!totals.tracks && albums.length) totals.tracks = albums.length

    return { artist: artistLabel, pageUrl, totals, albums }
  }

  const settled = await Promise.allSettled(artists.map(([label, url]) => fetchArtistAlbumsPage(url, label)))
  const groups = settled
    .filter((r): r is PromiseFulfilledResult<ArtistAlbumsGroup> => r.status === 'fulfilled')
    .map(r => r.value)
  return groups
}

const MEMBERS = ['BTS','Jimin','Jungkook','V','RM','Suga','J-Hope','Jin']

export async function fetchDaily200Positions() {
  const html = await fetchHTML('https://kworb.net/spotify/country/global_daily.html')
  const $ = cheerio.load(html)
  const rows: any[] = []
  $('table tr').each((_, tr) => {
    const t = $(tr).find('td')
    if (t.length < 5) return
    const rank = num($(t[0]).text())
    const name = $(t[1]).text().trim()
    const artist = $(t[2]).text().trim()
    if (!rank) return
    if (MEMBERS.some(m => new RegExp(`\\b${m}\\b`, 'i').test(artist) || new RegExp(`\\b${m}\\b`, 'i').test(name))) {
      rows.push({ rank, artist, name })
    }
  })
  return rows
}

export async function fetchMostStreamedArtists() {
  const html = await fetchHTML('https://kworb.net/spotify/artists.html')
  const $ = cheerio.load(html)
  const rows: any[] = []
  $('table tr').each((_, tr) => {
    const t = $(tr).find('td')
    if (t.length < 4) return
    const rank = num($(t[0]).text())
    const artist = $(t[1]).text().trim()
    const url = $(t[1]).find('a').attr('href') ? 'https://kworb.net/spotify/' + $(t[1]).find('a').attr('href') : undefined
    const streams = num($(t[2]).text())
    if (rank && artist) rows.push({ rank, artist, streams, url })
  })
  return rows
}

export async function fetchMonthlyListeners() {
  const html = await fetchHTML('https://kworb.net/spotify/listeners.html')
  const $ = cheerio.load(html)
  const rows: any[] = []
  $('table tr').each((_, tr) => {
    const t = $(tr).find('td')
    if (t.length < 4) return
    const rank = num($(t[0]).text())
    const artist = $(t[1]).text().trim()
    const url = $(t[1]).find('a').attr('href') ? 'https://kworb.net/spotify/' + $(t[1]).find('a').attr('href') : undefined
    const listeners = num($(t[2]).text())
    if (rank && artist) rows.push({ rank, artist, listeners, url })
  })
  return rows
}


