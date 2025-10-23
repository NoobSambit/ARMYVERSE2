import * as cheerio from 'cheerio'

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36'

const fetchHTML = async (url: string) => {
  const res = await fetch(url, { headers: { 'user-agent': UA }, cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return await res.text()
}

const num = (s?: string) => (s ? Number(s.replace(/[^0-9.-]/g, '')) || 0 : 0)

export interface YouTubeSong {
  rank: number
  videoId?: string
  title: string
  artist: string
  views: number
  yesterday: number // streams gained yesterday
  published: string
  thumbnail?: string
  url?: string
}

export interface YouTubeArtistGroup {
  artist: string
  pageUrl: string
  songs: YouTubeSong[]
}

// Member keywords for filtering
const MEMBER_KEYWORDS: Record<string, RegExp[]> = {
  BTS: [/\bBTS\b/i, /방탄소년단/i, /防弾少年団/i],
  Jungkook: [/\bJung\s?Kook\b/i, /\bJungkook\b/i, /정국/i],
  V: [/\bV\b(?!\w)/i, /\bTaehyung\b/i, /뷔/i, /태형/i],
  Suga: [/\bSuga\b/i, /\bAgust\s?D\b/i, /슈가/i, /민윤기/i],
  RM: [/\b(?:RM|Rap\s?Monster)\b/i, /남준/i, /알엠/i],
  Jimin: [/\bJimin\b/i, /지민/i, /박지민/i],
  Jin: [/\bJin\b(?!\w)/i, /\bSeokjin\b/i, /진/i, /석진/i],
  'J-Hope': [/\bJ-?Hope\b/i, /\bJhope\b/i, /제이홉/i, /호석/i, /정호석/i],
}

function matchesArtist(text: string, artist: string): boolean {
  if (artist === 'BTS') {
    // For BTS, check it's actually BTS and not a solo member
    const isBTS = MEMBER_KEYWORDS.BTS.some(re => re.test(text))
    if (!isBTS) return false
    // Exclude if it's clearly a solo member
    const soloMembers = ['Jungkook', 'V', 'Suga', 'RM', 'Jimin', 'Jin', 'J-Hope']
    const isSolo = soloMembers.some(m => 
      MEMBER_KEYWORDS[m].some(re => re.test(text))
    )
    return !isSolo
  }
  
  const patterns = MEMBER_KEYWORDS[artist]
  if (!patterns) return false
  return patterns.some(re => re.test(text))
}

// Extract YouTube video ID from kworb URL
function extractVideoId(url?: string): string | undefined {
  if (!url) return undefined
  const match = url.match(/video\/([a-zA-Z0-9_-]{11})/)
  return match?.[1]
}

export async function fetchBTSYouTube(): Promise<YouTubeArtistGroup[]> {
  const artists = [
    'BTS',
    'Jungkook',
    'V',
    'Suga',
    'RM',
    'Jimin',
    'Jin',
    'J-Hope'
  ]
  
  // All artists share the same page, so we fetch once and filter
  const pageUrl = 'https://kworb.net/youtube/artist/bts.html'
  const html = await fetchHTML(pageUrl)
  const $ = cheerio.load(html)
  
  const results: YouTubeArtistGroup[] = []
  
  // Find the main table
  const table = $('table').filter((_, el) => {
    const ths = $(el).find('th')
    const text = ths.map((_, th) => $(th).text().toLowerCase()).get().join('|')
    return text.includes('video') && text.includes('views') && text.includes('yesterday')
  }).first()
  
  if (!table || table.length === 0) {
    console.warn('YouTube table not found')
    return []
  }
  
  // Parse header
  const headerRow = table.find('tr').first()
  const headerCells = headerRow.find('th')
  let idxVideo = 0, idxViews = 1, idxYesterday = 2, idxPublished = 3
  
  headerCells.each((i, th) => {
    const t = $(th).text().toLowerCase()
    if (t.includes('video')) idxVideo = i
    if (t.includes('views') && !t.includes('yesterday')) idxViews = i
    if (t.includes('yesterday')) idxYesterday = i
    if (t.includes('published')) idxPublished = i
  })
  
  // Collect all songs
  const allSongs: Array<YouTubeSong & { rawTitle: string }> = []
  
  table.find('tr').slice(1).each((_, tr) => {
    const tds = $(tr).find('td')
    if (tds.length < 3) return
    
    const videoCell = tds.eq(idxVideo)
    const title = videoCell.text().trim()
    const link = videoCell.find('a').attr('href')
    const videoId = extractVideoId(link)
    
    if (!title) return
    
    const views = num(tds.eq(idxViews).text())
    const yesterday = num(tds.eq(idxYesterday).text())
    const published = tds.eq(idxPublished).text().trim()
    
    const url = videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined
    const thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : undefined
    
    allSongs.push({
      rank: 0,
      videoId,
      title,
      rawTitle: title,
      artist: '',
      views,
      yesterday,
      published,
      thumbnail,
      url
    })
  })
  
  // Filter and group by artist
  for (const artistName of artists) {
    const filteredSongs = allSongs
      .filter(song => matchesArtist(song.rawTitle, artistName))
      .map(song => ({
        ...song,
        artist: artistName
      }))
    
    // Sort by yesterday and assign ranks
    filteredSongs.sort((a, b) => b.yesterday - a.yesterday)
    filteredSongs.forEach((song, idx) => {
      song.rank = idx + 1
    })
    
    results.push({
      artist: artistName,
      pageUrl,
      songs: filteredSongs
    })
  }
  
  return results
}

// Helper to get top N songs for an artist
export function getTopSongs(group: YouTubeArtistGroup, n: number = 6): YouTubeSong[] {
  return group.songs.slice(0, n)
}
